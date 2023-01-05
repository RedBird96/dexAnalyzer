import { Box, Button, Circle, Divider, Input, InputGroup, InputRightAddon, useColorMode, useColorModeValue } from '@chakra-ui/react'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import { useToast } from '@chakra-ui/react'
import BigNumber from 'bignumber.js';
import { Signer, ethers } from 'ethers';
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
  LOADING,
  CONNECT,
  SWITCHNETWORK,
  SWAP,
  INSUFFICENT,
  APPROVE,
  PROCESSING,
}

export default function SwapTrade() {

  const {lpTokenPrice} = useLPTokenPrice();
  const address = useAddress();
  const {tokenData} = useTokenInfo();
  const colorMode = useColorMode();
  const toast = useToast()
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
      name: "",
      symbol: "",
      image: "",
      network: lpTokenAddress.network,
      contractAddress: lpTokenAddress.quoteCurrency_contractAddress
    } as ERC20Token
  );
  const [toToken, setToToken] = useState<ERC20Token>({
    name: "",
    symbol: "",
    image: "",
    network: lpTokenAddress.network,
    contractAddress: lpTokenAddress.baseCurrency_contractAddress
  } as ERC20Token);

  const { fetchPairReserves } = useInitialize();
  
  const [pricebase, setPriceBase] = useState<number>(0);
  const [pricequote, setPriceQuote] = useState<number>(0);
  const [label, setLabel] = useState<BTN_LABEL>(BTN_LABEL.LOADING);
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
        tokenAddress: string,
        signer: Signer,
        approvalAccount: string,
        network: number
      ) => {
        try {
          const tokenContract = getContract(
            tokenAddress,
            network == constant.BINANCE_NETOWRK ? Bep20Abi : Erc20Abi,
            network,
            signer,
          );

          const response = await tokenContract['allowance'](
            approvalAccount,
            network== constant.BINANCE_NETOWRK ? constant.PANCAKESWAP_ROUTER.v2 : constant.UNISWAP_ROUTER.v2
          );
          const currentAllowance = ethers.utils.formatEther(response);
          return currentAllowance > "0.0";
        } catch (error) {
          return false;
        }
      },
      onApprove: async (
        tokenAddress:string, 
        network: number
      ) => {
        try {
          setExecuting(true);
          const tokenContract = getContract(
            tokenAddress,
            network == constant.BINANCE_NETOWRK ? Bep20Abi : Erc20Abi,
            network,
            signer,
          );
          return await tokenContract['approve'](
            network == constant.BINANCE_NETOWRK ? constant.PANCAKESWAP_ROUTER.v2 : constant.UNISWAP_ROUTER.v2, 
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
        toast({
          title: `Transaction receipt`,
          status: 'success',
          position: 'bottom-right',
          isClosable: true,
        })
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
        toast({
          title: `Transaction failed`,
          status: 'warning',
          position: 'bottom-right',
          isClosable: true,
        })        
        setExecuting(false);
      },
      onSuccess: async () => {
        toast({
          title: `Transaction receipt`,
          status: 'success',
          position: 'bottom-right',
          isClosable: true,
        })
        setExecuting(false);
        fetchPairReserves();
      },
  });
  useEffect(() => {
    setFromTokenValue(0);
    setToTokenValue(0);
  }, [tokenData, lpTokenAddress.quoteCurrency_contractAddress])
  useEffect(() => {
    setShowConnect(connection[0].data.connected);
    if (connection[0].data.connected && fromToken.name != undefined) {
      if (network[0].data.chain.id != tokenData.network) {
        setLabel(BTN_LABEL.SWITCHNETWORK)
      } else if (!isApproved) {
        setLabel(BTN_LABEL.APPROVE);
      } else if (fromTokenValue > maxFromToken) {
        setLabel(BTN_LABEL.INSUFFICENT);
      } else {
        setLabel(BTN_LABEL.SWAP);
      }
    }
  }, [connection, account])

  useEffect(() => {

    const setTokens = async() => {

      if (lpTokenAddress.quoteCurrency_name == "WBNB" || lpTokenAddress.quoteCurrency_name == "WETH") {
        setFromToken({
          name: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          symbol: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          image: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.logoUri : constant.ETHERToken.logoUri,
          network: lpTokenAddress.network,
          contractAddress: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.address : constant.ETHERToken.address
        } as ERC20Token)        
      } else {
        const fromTokenimg = await getTokenLogoURL(
          lpTokenAddress.quoteCurrency_contractAddress, 
          lpTokenAddress.network, 
          lpTokenAddress.quoteCurrency_name
        );
        setFromToken({
          name: lpTokenAddress.quoteCurrency_name,
          symbol: lpTokenAddress.quoteCurrency_name,
          image: fromTokenimg,
          network: lpTokenAddress.network,
          contractAddress: lpTokenAddress.quoteCurrency_contractAddress
        } as ERC20Token)        
      }

      if (lpTokenAddress.baseCurrency_name == "WBNB" || lpTokenAddress.baseCurrency_name == "WETH") {
        setToToken({
          name: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          symbol: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          image: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.logoUri : constant.ETHERToken.logoUri,
          network: lpTokenAddress.network,
          contractAddress: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.address : constant.ETHERToken.address
        } as ERC20Token)        
      } else {
        const toTokenimg = await getTokenLogoURL(
          lpTokenAddress.baseCurrency_contractAddress, 
          lpTokenAddress.network, 
          lpTokenAddress.baseCurrency_name
        );
        setToToken({
          name: lpTokenAddress.baseCurrency_name,
          symbol: lpTokenAddress.baseCurrency_name,
          image: toTokenimg,
          network: lpTokenAddress.network,
          contractAddress: lpTokenAddress.baseCurrency_contractAddress
        } as ERC20Token)        
      }
      
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
        setPriceBase((lpTokenAddress.token0_reserve / lpTokenAddress.token1_reserve));
        setPriceQuote((lpTokenAddress.token1_reserve / lpTokenAddress.token0_reserve));
      } else {
        setPriceQuote((lpTokenAddress.token0_reserve / lpTokenAddress.token1_reserve));
        setPriceBase((lpTokenAddress.token1_reserve / lpTokenAddress.token0_reserve));
      }
    }

    if (lpTokenAddress.quoteCurrency_contractAddress != undefined &&
        lpTokenAddress.baseCurrency_contractAddress != undefined
      ){
      setTokens();  
    }

  }, [lpTokenAddress, address]);

  useEffect(() => {
    if (fromToken.name != undefined && toToken.name != undefined) {
      if (!isApproved) {
        setLabel(BTN_LABEL.APPROVE);
      } else if (fromTokenValue > maxFromToken) {
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

      if (fromToken.contractAddress == tokenData.contractAddress) {
        setToTokenValue(fromTokenValue * pricebase);
      }
      else {
        setToTokenValue(fromTokenValue * pricequote);
      }
    }
  }, [fromTokenValue, fromToken, bestTrade, lpTokenPrice, allowedSlippage])

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
    } else if (label == BTN_LABEL.APPROVE) {
      handleApprove();
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
              >
                %
              </InputRightAddon>
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
            <p className = {style.commentText}>{label == BTN_LABEL.LOADING ? "0%" : "<0.01%"}</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price:</p>
            <p className = {style.commentText}>{pricebase.toFixed(5)}&nbsp;{lpTokenAddress.baseCurrency_name+"/"+lpTokenAddress.quoteCurrency_name}</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price:</p>
            <p className = {style.commentText}>{pricequote.toFixed(5)}&nbsp;{lpTokenAddress.quoteCurrency_name+"/"+lpTokenAddress.baseCurrency_name}</p>
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
        onClick = {label == BTN_LABEL.SWAP ? handleConfirm : handleOther}
        isDisabled = {!showConnect || label == BTN_LABEL.LOADING || executing}
      >
        {
          executing === true ? "PROCESSING..." :
          label == BTN_LABEL.LOADING ?
          "LOADING...":
          label == BTN_LABEL.CONNECT ?
          "CONNECT WALLET" :
          label == BTN_LABEL.SWITCHNETWORK ?
          "SWITCH NETWORK":
          label == BTN_LABEL.APPROVE ?
          "APPROVE" :
          label == BTN_LABEL.INSUFFICENT ?
          "INSUFFICIENT FUND":
          "SWAP"
        }
      </Button>
    </Box>
  )
}