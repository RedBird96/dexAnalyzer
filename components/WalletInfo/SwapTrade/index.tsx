import { Box, Button, Circle, Divider, Input, InputGroup, InputRightAddon, useColorMode, useColorModeValue } from '@chakra-ui/react'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import BigNumber from 'bignumber.js';
import { Signer } from 'ethers';
import style from './SwapTrade.module.css'
import {
  DownArrowDark,
  DownArrowLight,
  SwitchToken
} from "../../../assests/icon"
import InputBox from '../InputBox';
import { ERC20Token, TokenSide } from '../../../utils/type';
import { useLPTokenPrice, useTokenInfo } from '../../../hooks';
import * as constant from '../../../utils/constant'
import { getTokenBalance, getTokenLogoURL } from '../../../api';
import { useAccount, useAddress, useConnect, useNetwork, useSigner } from '@thirdweb-dev/react';
import { Field } from '../../../state/swap/types';
import { useToken } from '../../../hooks/useTokenList';
import { useTradeExactInOut, useTradeInExactOut } from '../../../hooks/useTradeInOut';
import { getBalanceAmount, getDecimalAmount } from '../../../utils';
import useSwap, { useSwapArguments } from '../../../hooks/useSwap';
import useInitialize from '../../../hooks/useInitialize';
import { minimumAmountOut } from '../../../utils/pairs';
import { useAppDispatch } from '../../../state';
import { replaceState } from '../../../state/swap';
import { useSwapState } from '../../../state/swap/hooks';
import { useApproveConfirmTransaction } from '../../../hooks/useApproveConfirmTransaction';
import { getContract } from '../../../utils/contract';
import Bep20Abi from '../../../config/BEP20ABI.json'
import Erc20Abi from '../../../config/ERC20ABI.json'
import { MaxUint256 } from '@ethersproject/constants';

enum BTN_LABEL {
  CONNECT,
  SWITCHNETWORK,
  SWAP,
  INSUFFICENT,
  APPROVE
}

export default function SwapTrade() {

  const {lpTokenPrice} = useLPTokenPrice();
  const address = useAddress();
  const {tokenData} = useTokenInfo();
  const colorMode = useColorMode();
  const {lpTokenAddress} = useLPTokenPrice();
  const borderColor = useColorModeValue("#C3C3C3", "#2E2E2E");
  const mainbg = useColorModeValue("#efefef", "#121212");
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const [fromTokenValue, setFromTokenValue] = useState<number>(0);
  const [toTokenValue, setToTokenValue] = useState<number>(0);
  const [maxFromToken, setMaxFromToken] = useState<number>(0);
  const [miniValue, setMiniValue] = useState(0);
  const [executing, setExecuting] = useState<boolean>(false);
  const [fromToken, setFromToken] = useState<ERC20Token>(
    {
      name: lpTokenAddress.quoteCurrency_name == "WBNB" ? "BNB" : 
            lpTokenAddress.quoteCurrency_name == "WETH" ? "ETH" : lpTokenAddress.quoteCurrency_name,
      symbol: lpTokenAddress.quoteCurrency_name == "WBNB" ? "BNB" :
              lpTokenAddress.quoteCurrency_name == "WETH" ? "ETH" : lpTokenAddress.quoteCurrency_name,
      image: "",
      network: lpTokenAddress.network,
      contractAddress: lpTokenAddress.quoteCurrency_contractAddress
    } as ERC20Token
  );
  const [toToken, setToToken] = useState<ERC20Token>({
    name: lpTokenAddress.baseCurrency_name == "WBNB" ? "BNB" : 
          lpTokenAddress.baseCurrency_name == "WETH" ? "ETH" : lpTokenAddress.baseCurrency_name,
    symbol: lpTokenAddress.baseCurrency_name == "WBNB" ? "BNB" :
            lpTokenAddress.baseCurrency_name == "WETH" ? "ETH" : lpTokenAddress.baseCurrency_name,
    image: "",
    network: lpTokenAddress.network,
    contractAddress: lpTokenAddress.baseCurrency_contractAddress
  } as ERC20Token);

  const { fetchPairReserves } = useInitialize();
  
  const [pricebase, setPriceBase] = useState<string>("0");
  const [pricequote, setPriceQuote] = useState<string>("0");
  const [label, setLabel] = useState<BTN_LABEL>(BTN_LABEL.SWAP);
  const {
    [Field.Input]: { currencyId: inputCurrencyId },
    [Field.Output]: { currencyId: outputCurrencyId },
  } = useSwapState();
  
  const connection = useConnect();
  const network = useNetwork();
  const account = useAccount();
  const signer = useSigner();
  const dispatch = useAppDispatch();
  const [showConnect, setShowConnect] = useState(false);
  const inputToken = useToken(inputCurrencyId);
  const outputToken = useToken(outputCurrencyId);
  
  const amountIn = useMemo(
    () => getDecimalAmount(new BigNumber(fromTokenValue), inputToken.decimals),
    [fromToken, fromTokenValue]
  );

  const amountOut = useMemo(
    () => getDecimalAmount(new BigNumber(toTokenValue), outputToken.decimals),
    [toToken, toTokenValue]
  );
    
  
  const isExactIn = fromTokenValue !== 0;

  const tradeOnExactInOut = useTradeExactInOut(
    isExactIn ? inputToken : undefined,
    isExactIn ? amountIn : undefined,
    isExactIn ? outputToken : undefined
  );
  const tradeOnInExactOut = useTradeInExactOut(
    !isExactIn ? inputToken : undefined,
    !isExactIn ? amountOut : undefined,
    !isExactIn ? outputToken : undefined
  );
  const bestTrade = isExactIn ? tradeOnExactInOut : tradeOnInExactOut;
  const [allowedSlippage, setUserSlippageTolerance] = useState(0.5);
  const { onSwap } = useSwap(bestTrade, allowedSlippage);

  const { isApproved, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      onRequiresApproval: async (
        signer: Signer,
        approvalAccount: string 
      ) => {
        try {
          console.log('approve fromToken', fromToken.contractAddress);

          const tokenContract = getContract(
            fromToken.contractAddress,
            tokenData.network == constant.BINANCE_NETOWRK ? Bep20Abi : Erc20Abi,
            tokenData.network,
            signer,
          );

          console.log('approve getContract', tokenContract);

          const response = await tokenContract['allowance'](
            approvalAccount,
            tokenData.network == constant.BINANCE_NETOWRK ? constant.PANCAKESWAP_ROUTER.v2 : constant.UNISWAP_ROUTER.v2
          );
          console.log('allowance response', response);
          const currentAllowance = response;
          return currentAllowance.gt(0);
        } catch (error) {
          return false;
        }
      },
      onApprove: async () => {
        try {
          setExecuting(true);
          const tokenContract = getContract(
            fromToken.contractAddress,
            tokenData.network == constant.BINANCE_NETOWRK ? Bep20Abi : Erc20Abi,
            tokenData.network,
            signer,
          );
          return await tokenContract['approve'](
            tokenData.network == constant.BINANCE_NETOWRK ? constant.PANCAKESWAP_ROUTER.v2 : constant.UNISWAP_ROUTER.v2, 
            MaxUint256);
        } catch (error) {
          console.error(error);
          setExecuting(false);
          return false;
        }
      },
      onApproveSuccess: async () => {
        // if (isToastEnabled && toastInfo) {
        //   toastInfo('Approved', 'Contract enabled - you can now buy $DeHub');
        // }
        handleConfirm();
      },
      onConfirm: async () => {
        if (!onSwap) {
          throw new Error('Swap hook function error');
        }
        setExecuting(true);
        return onSwap();
      },
      onFail: async () => {
        setExecuting(false);
      },
      onSuccess: async () => {
        // if (isToastEnabled && toastSuccess) {
        //   toastSuccess('Buy DeHub', `You've successfully purchased DeHub`);
        // }
        setExecuting(false);
        fetchPairReserves();
      },
  });
  useEffect(() => {
    setFromTokenValue(0);
    setToTokenValue(0);
  }, [tokenData])
  useEffect(() => {
    setShowConnect(connection[0].data.connected);
    if (connection[0].data.connected) {
      if (network[0].data.chain.id != tokenData.network) {
        setLabel(BTN_LABEL.SWITCHNETWORK)
      } else if (fromTokenValue > maxFromToken) {
        setLabel(BTN_LABEL.INSUFFICENT);
      } else {
        setLabel(BTN_LABEL.SWAP);
      }
    }
  }, [connection, account])

  useEffect(() => {

    const setTokens = async() => {

      const fromTokenimg = await getTokenLogoURL(
        lpTokenAddress.quoteCurrency_contractAddress, 
        lpTokenAddress.network, 
        lpTokenAddress.quoteCurrency_name
      );
      const toTokenimg = await getTokenLogoURL(
        lpTokenAddress.baseCurrency_contractAddress,
        lpTokenAddress.network, 
        lpTokenAddress.baseCurrency_name
      );
      setFromToken({
        name: lpTokenAddress.quoteCurrency_name == "WBNB" ? "BNB" : 
              lpTokenAddress.quoteCurrency_name == "WETH" ? "ETH" : lpTokenAddress.quoteCurrency_name,
        symbol: lpTokenAddress.quoteCurrency_name == "WBNB" ? "BNB" :
                lpTokenAddress.quoteCurrency_name == "WETH" ? "ETH" : lpTokenAddress.quoteCurrency_name,
        image: fromTokenimg,
        network: lpTokenAddress.network,
        contractAddress: lpTokenAddress.quoteCurrency_contractAddress
      } as ERC20Token)

      setToToken( {
        name: lpTokenAddress.baseCurrency_name == "WBNB" ? "BNB" : 
              lpTokenAddress.baseCurrency_name == "WETH" ? "ETH" : lpTokenAddress.baseCurrency_name,
        symbol: lpTokenAddress.baseCurrency_name == "WBNB" ? "BNB" :
                lpTokenAddress.baseCurrency_name == "WETH" ? "ETH" : lpTokenAddress.baseCurrency_name,
        image: toTokenimg,
        network: lpTokenAddress.network,
        contractAddress: lpTokenAddress.baseCurrency_contractAddress
      } as ERC20Token)

      if (address != undefined) {
        const bal = await getTokenBalance(
          (lpTokenAddress.quoteCurrency_name == "WBNB" || lpTokenAddress.quoteCurrency_name == "WETH") ? "NATIVE" : lpTokenAddress.quoteCurrency_contractAddress,
          address, 
          lpTokenAddress.network
        );
        if (bal != constant.NOT_FOUND_TOKEN) {
          setMaxFromToken(parseFloat(bal));
        }
      }

      dispatch(
        replaceState({
          inputCurrencyId: lpTokenAddress.quoteCurrency_contractAddress,
          outputCurrencyId: lpTokenAddress.baseCurrency_contractAddress,
        })
      );

      if (lpTokenAddress.tokenside == TokenSide.token1){
        setPriceBase((lpTokenAddress.token0_reserve / lpTokenAddress.token1_reserve).toFixed(5));
        setPriceQuote((lpTokenAddress.token1_reserve / lpTokenAddress.token0_reserve).toFixed(5));
      } else {
        setPriceQuote((lpTokenAddress.token0_reserve / lpTokenAddress.token1_reserve).toFixed(5));
        setPriceBase((lpTokenAddress.token1_reserve / lpTokenAddress.token0_reserve).toFixed(5));
      }
    }

    if (lpTokenAddress.quoteCurrency_contractAddress != undefined &&
        lpTokenAddress.baseCurrency_contractAddress != undefined
      ){
      setTokens();  
    }

  }, [lpTokenAddress, address]);

  useEffect(() => {
    if (fromTokenValue > maxFromToken) {
      setLabel(BTN_LABEL.INSUFFICENT);
    } else {
      setLabel(BTN_LABEL.SWAP);
    }

    if (bestTrade != undefined) {
      const outMinAmount = getBalanceAmount(
        minimumAmountOut(bestTrade.tradeType, bestTrade.amountOut, allowedSlippage)
        .integerValue(),
        bestTrade.tokenOut.decimals).toFixed(5);      
      setMiniValue(parseFloat(outMinAmount));
    }

    if (fromToken.contractAddress == tokenData.contractAddress)
      setToTokenValue(fromTokenValue * lpTokenPrice.tokenPrice);
    else 
      setToTokenValue(fromTokenValue / lpTokenPrice.tokenPrice);

  }, [fromTokenValue, fromToken, bestTrade, lpTokenPrice])

  const switchSwapTokens = async () => {
    const saveFromToken = fromToken;
    const saveToToken = toToken;
    setToToken(saveFromToken);
    setFromToken(saveToToken);

    if (address != undefined) {
      const bal = await getTokenBalance(
        (saveToToken.symbol == "WBNB" || saveToToken.symbol == "WETH") ? "NATIVE" : saveToToken.contractAddress,
        address, 
        lpTokenAddress.network
      );
      if (bal != constant.NOT_FOUND_TOKEN) {
        setMaxFromToken(parseFloat(bal));
      }
    }

    dispatch(
      replaceState({
        inputCurrencyId: saveToToken.contractAddress,
        outputCurrencyId: saveFromToken.contractAddress,
      })
    );
    
  }

  const handleSlippage = (e: { target: { value: string; }; }) => {
    const value = e.target.value.toLowerCase();
    setUserSlippageTolerance(parseFloat(value));
  }

  const handleOther = () => {
    if (label == BTN_LABEL.SWITCHNETWORK) {
      account[0].data.connector.switchChain(tokenData.network);
    } else if (label == BTN_LABEL.INSUFFICENT) {

    }
  }

  return (
    <Box 
      className={style.tradeMain}
    >
      <Box 
        className={style.tradeInputSection}
      >
        <Box className={style.inputBlock}>
          <Box className={style.headerText} style = {{marginBottom:"1rem"}}>
            <p>From</p>
            <p style={{
              fontSize:"0.8rem",
              color:textColor
            }}>
              Balance: {maxFromToken.toFixed(5)}</p>
          </Box>
          <InputBox
            showMax = {true}
            token = {fromToken}
            setValue = {setFromTokenValue}
            value = {fromTokenValue.toString()}
          ></InputBox>
        </Box>
        <Box
          display = {"flex"}
          justifyContent = {"center"}
          onClick = {switchSwapTokens}
        >
          <Circle 
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
            size = "2rem"
            bg = {mainbg}
            cursor = {"pointer"}
          >
            {colorMode.colorMode == "dark" ?
              <SwitchToken/> :
              <DownArrowLight/> 
            }
          </Circle>
        </Box>
        <Box className={style.inputBlock}>
          <p className={style.headerText} style = {{marginBottom:"1rem"}}>To</p>
          <InputBox
            showMax = {false}
            token = {toToken}
            setValue = {setToTokenValue}
            value = {toTokenValue.toString()}
          ></InputBox>
        </Box>
      </Box>
      <Box 
        className={style.detailsSection}
      >
        <Box className={style.detailSlippage}>
          <p className={style.headerText} style = {{marginBottom:"1rem"}}>Slippage</p>
          <Box 
            display={"flex"}
            flexDirection={"row"}
            background = {mainbg}
            width = {"10rem"}
            alignItems={"center"}
            borderRadius={"5px"}
          >
            <InputGroup
              width={"6rem"}
            >
              <Input
                width = {"90%"}
                borderColor ={mainbg}
                type="number"
                _focus={{
                  boxShadow: 'none',
                  borderColor: mainbg
                }}
                _hover = {{
                  boxShadow: 'none',
                  borderColor: mainbg
                }}
                placeholder = "0%"
                
                value = {allowedSlippage}
                onChange = {handleSlippage}
              >
              </Input>
              <InputRightAddon 
                width = {"10%"}
                borderColor ={mainbg}
                background = {mainbg}
                children='%'
              />
            </InputGroup>
            <Divider 
              orientation="vertical" 
              style= {{
                borderColor:borderColor,
                height:"90%"
            }}/>
            <Box
              display = {"flex"}
              width = {"4rem"}
              alignItems = {"center"}
              justifyContent = {"center"}
              height = {"100%"}
              cursor = {"pointer"}
              onClick = {() => setUserSlippageTolerance(0.5)}
            >
              <p className={style.headerText}>Auto</p>
            </Box>
          </Box>
        </Box>
        <Box 
          className={style.detailComment} 
          background={mainbg}
        >
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Minimum Received:</p>
            <p className = {style.commentText}>{miniValue}&nbsp;{toToken.symbol}</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price Impact:</p>
            <p className = {style.commentText}>&lt;0.01%</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price:</p>
            <p className = {style.commentText}>{pricebase}&nbsp;{lpTokenAddress.baseCurrency_name+"/"+lpTokenAddress.quoteCurrency_name}</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price:</p>
            <p className = {style.commentText}>{pricequote}&nbsp;{lpTokenAddress.quoteCurrency_name+"/"+lpTokenAddress.baseCurrency_name}</p>
          </Box>
        </Box>
      </Box>
      <Button 
        className={style.buttonSection}
        background = {tokenData.network == constant.BINANCE_NETOWRK ? "#F0B90B" : "#FB118E"}
        _hover = {{
          bg: tokenData.network == constant.BINANCE_NETOWRK ? "#F0B90B" : "#FB118E"
        }}
        color = {tokenData.network == constant.BINANCE_NETOWRK ? "black" : "white"}
        onClick = {label == BTN_LABEL.SWAP ? onSwap : handleOther}
        isDisabled = {!showConnect}
      >
        {
          label === BTN_LABEL.SWAP ? 
          "SWAP" : label === BTN_LABEL.INSUFFICENT ?
          "INSUFFICIENT FUND": label == BTN_LABEL.APPROVE?
          "APPROVE":
          "SWITCH NETWORK"
        }
      </Button>
    </Box>
  )
}