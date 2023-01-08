import { Box, Button, Circle, Divider, Input, InputGroup, InputRightAddon, useColorMode, useColorModeValue } from '@chakra-ui/react'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import { useToast } from '@chakra-ui/react'
import BigNumber from 'bignumber.js';
import { Signer, ethers, utils } from 'ethers';
import style from './SwapTrade.module.css'
import {
  DownArrowLight,
  SwitchToken
} from "../../../assests/icon"
import InputBox from '../InputBox';
import { ERC20Token, TradeType } from '../../../utils/type';
import { useDebounce, useLPTokenPrice, useTokenInfo } from '../../../hooks';
import * as constant from '../../../utils/constant'
import { getTokenBalance, getTokenLogoURL } from '../../../api';
import { useAccount, useAddress, useConnect, useNetwork, useSigner } from '@thirdweb-dev/react';
import { Field } from '../../../state/swap/types';
import { useToken } from '../../../hooks/useTokenList';
import { useTradeExactInOut, useTradeInExactOut } from '../../../hooks/useTradeInOut';
import { getBalanceAmount, getDecimalAmount } from '../../../utils';
import useSwap from '../../../hooks/useSwap';
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
import { getAmountIn, getAmountOut } from '../../../utils/router';

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
  const slectedColor = useColorModeValue("#005CE5","#3A3A29");
  const [fromTokenValue, setFromTokenValue] = useState<number>(0);
  const [toTokenValue, setToTokenValue] = useState<number>(0);
  const debouncedFromTokenValue = useDebounce<number>(fromTokenValue, 800);
  const debouncedToTokenValue = useDebounce<number>(toTokenValue, 800);
  const [inputSide, setInputSide] = useState<boolean>(true); //true: fromToken, false: toToken
  const [maxFromToken, setMaxFromToken] = useState<number>(0);
  const [maxToToken, setMaxToToken] = useState<number>(0);
  const [miniValue, setMiniValue] = useState(0);
  const [executing, setExecuting] = useState<boolean>(false);
  const [fromToken, setFromToken] = useState<ERC20Token>(
    {
      name: "",
      symbol: "",
      image: "",
      network: lpTokenAddress.network,
      contractAddress: lpTokenAddress.quoteCurrency_contractAddress,
      decimals:0
    } as ERC20Token
  );
  const [toToken, setToToken] = useState<ERC20Token>({
    name: "",
    symbol: "",
    image: "",
    network: lpTokenAddress.network,
    contractAddress: lpTokenAddress.baseCurrency_contractAddress,
    decimals:0
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
    
  const isExactIn = inputSide;//fromTokenValue !== 0;

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
  const [autoSlippage, setAutoSlippage] = useState<boolean>(false);
  const [allowedSlippage, setUserSlippageTolerance] = useState(0.5);
  const { onSwap } = useSwap(bestTrade, allowedSlippage * 100);
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
          title: `Transaction approved`,
          status: 'success',
          position: 'bottom-right',
          isClosable: true,
        })
        setExecuting(false);
      },
      onConfirm: async () => {
        if (!onSwap) {
          throw new Error('Swap hook function error');
        }
        setExecuting(true);
        return onSwap();
      },
      onFail: async (error: any) => {
        setExecuting(false);
        const error_msg = error.toString();
        let msg = "";
        if (error_msg.includes("user reject") || error_msg.includes("User denied transaction")) {
          msg = "User denied transaction signature";
        } else if (error_msg.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
          msg = "Slippage too low"
        }
        toast({
          title: `Transaction failed: ${msg}`,
          status: 'warning',
          position: 'bottom-right',
          isClosable: true,
        })        
      },
      onSuccess: async () => {
        toast({
          title: `Transaction approved`,
          status: 'success',
          position: 'bottom-right',
          isClosable: true,
        })
        setExecuting(false);
        fetchPairReserves();
      },
  });


  const fetchBalance = useCallback(async () => {
    if (address != undefined && fromToken.symbol != "") {
      const bal = await getTokenBalance(
        (fromToken.symbol == "BNB" || fromToken.symbol == "ETH") ? "NATIVE" : fromToken.contractAddress,
        address, 
        fromToken.network
      );
      if (bal != constant.NOT_FOUND_TOKEN) {  
        setMaxFromToken(parseFloat(bal));
      }
    }
    if (address != undefined && toToken.symbol != "") {
      const bal = await getTokenBalance(
        (toToken.symbol == "BNB" || toToken.symbol == "ETH") ? "NATIVE" : toToken.contractAddress,
        address, 
        toToken.network
      );
      if (bal != constant.NOT_FOUND_TOKEN) {  
        setMaxToToken(parseFloat(bal));
      }
    }
  }, [fromToken, toToken, address])

  const setZero = () => {
    setFromTokenValue(0);
    setMiniValue(0);
    setPriceBase(0);
    setPriceQuote(0);
  }

  fetchBalance();

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

      setInputSide(true);
      if (lpTokenAddress.quoteCurrency_name == "WBNB" || lpTokenAddress.quoteCurrency_name == "WETH") {
        setFromToken({
          name: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          symbol: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          image: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.logoUri : constant.ETHERToken.logoUri,
          network: lpTokenAddress.network,
          contractAddress: lpTokenAddress.quoteCurrency_name == "WBNB" ? constant.BNBToken.address : constant.ETHERToken.address,
          decimals: lpTokenAddress.quoteCurrency_decimals
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
          contractAddress: lpTokenAddress.quoteCurrency_contractAddress,
          decimals: lpTokenAddress.quoteCurrency_decimals
        } as ERC20Token)        
      }

      if (lpTokenAddress.baseCurrency_name == "WBNB" || lpTokenAddress.baseCurrency_name == "WETH") {
        setToToken({
          name: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          symbol: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.name : constant.ETHERToken.name,
          image: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.logoUri : constant.ETHERToken.logoUri,
          network: lpTokenAddress.network,
          contractAddress: lpTokenAddress.baseCurrency_name == "WBNB" ? constant.BNBToken.address : constant.ETHERToken.address,
          decimals: lpTokenAddress.baseCurrency_decimals
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
          contractAddress: lpTokenAddress.baseCurrency_contractAddress,
          decimals: lpTokenAddress.baseCurrency_decimals
        } as ERC20Token)        
      }

      setZero();
      dispatch(
        replaceState({
          inputCurrencyId: lpTokenAddress.quoteCurrency_contractAddress,
          outputCurrencyId: lpTokenAddress.baseCurrency_contractAddress,
        })
      );
    }

    if (lpTokenAddress.quoteCurrency_contractAddress != undefined &&
        lpTokenAddress.baseCurrency_contractAddress != undefined
      ){
      setTokens();  
    }

  }, [lpTokenAddress.quoteCurrency_contractAddress, lpTokenAddress.baseCurrency_contractAddress, address]);

  useEffect(() => {

    if (fromToken.name != "" && toToken.name != "") {
      if (!isApproved) {
        setLabel(BTN_LABEL.APPROVE);
      } else if (fromTokenValue > maxFromToken) {
        setLabel(BTN_LABEL.INSUFFICENT);
      } else {
        setLabel(BTN_LABEL.SWAP);
      }

    }
  }, [fromToken,bestTrade, lpTokenPrice, allowedSlippage, debouncedFromTokenValue, debouncedToTokenValue])
  
  useEffect(() => {
    getPrice(); 
  }, [debouncedFromTokenValue, debouncedToTokenValue])

  const getPrice = async() => {
    if (inputSide) {
      if (fromTokenValue != 0) {
        let toAmount = 0;
        const value = new BigNumber(fromTokenValue * Math.pow(10, fromToken.decimals));
        if (lpTokenAddress.baseCurrency_contractAddress.toLowerCase() == fromToken.contractAddress.toLowerCase()) {
          const res = await getAmountOut(lpTokenAddress.baseCurrency_contractAddress, lpTokenAddress.quoteCurrency_contractAddress, value, fromToken.network);
          if (res != undefined) {
            toAmount = parseFloat(utils.formatUnits(res[0][1],lpTokenAddress.quoteCurrency_decimals));
            setToTokenValue(toAmount);
            setPriceBase(1 / fromTokenValue * toAmount);
            setPriceQuote(1 / (1 / fromTokenValue * toAmount));
          }
        } else {
          const res = await getAmountOut(lpTokenAddress.quoteCurrency_contractAddress, lpTokenAddress.baseCurrency_contractAddress, value, fromToken.network);
          if (res != undefined) {
            toAmount = parseFloat(utils.formatUnits(res[0][1],lpTokenAddress.baseCurrency_decimals));
            setToTokenValue(toAmount);
            setPriceQuote(1 / fromTokenValue * toAmount);
            setPriceBase(1 / (1 / fromTokenValue * toAmount));
          }
        }

        if (bestTrade != undefined) {
          const amount = getDecimalAmount(BigNumber(toAmount), toToken.decimals);
          const outMinAmount = getBalanceAmount(
            minimumAmountOut(bestTrade.tradeType, amount, allowedSlippage * 100)
            .integerValue(),
            bestTrade.tokenOut.decimals).toFixed(5);      
          setMiniValue(parseFloat(outMinAmount));
        }
      } else {
        setToTokenValue(0);
        setMiniValue(0);
      }
    } else {
      if (toTokenValue != 0){
        let fromAmount = 0;
        const value = new BigNumber(toTokenValue * Math.pow(10, toToken.decimals));
        if (lpTokenAddress.baseCurrency_contractAddress.toLowerCase() == toToken.contractAddress.toLowerCase()) {
          const res = await getAmountIn(lpTokenAddress.quoteCurrency_contractAddress, lpTokenAddress.baseCurrency_contractAddress, value, toToken.network);
          if (res != undefined) {
            fromAmount = parseFloat(utils.formatUnits(res[0][0],lpTokenAddress.quoteCurrency_decimals));
            setFromTokenValue(fromAmount);
            setPriceBase(1 / toTokenValue * fromAmount);
            setPriceQuote(1 / (1 / toTokenValue * fromAmount));
          }
        } else {
          const res = await getAmountIn( lpTokenAddress.baseCurrency_contractAddress, lpTokenAddress.quoteCurrency_contractAddress, value, toToken.network);
          if (res != undefined) {
            fromAmount = parseFloat(utils.formatUnits(res[0][0],lpTokenAddress.baseCurrency_decimals));
            setFromTokenValue(fromAmount);
            setPriceBase(1 / toTokenValue * fromAmount);
            setPriceQuote(1 / (1 / toTokenValue * fromAmount));
          }
        }

        if (bestTrade != undefined) {
          const amount = getDecimalAmount(BigNumber(toTokenValue), toToken.decimals);
          const outMinAmount = getBalanceAmount(
            minimumAmountOut(TradeType.EXACT_INPUT, amount, allowedSlippage * 100)
            .integerValue(),
            toToken.decimals).toFixed(5);      
          setMiniValue(parseFloat(outMinAmount));
        }
      } else {
        setZero();
      }
    }
  }

  const switchSwapTokens = async () => {
    
    const saveFromToken = fromToken;
    const saveToToken = toToken;
    setToToken(saveFromToken);
    setFromToken(saveToToken);

    dispatch(
      replaceState({
        inputCurrencyId: saveToToken.symbol == "BNB" ? constant.WHITELIST_TOKENS.BSC.BNB : saveToToken.symbol == "ETH" ? constant.WHITELIST_TOKENS.ETH.ETH : saveToToken.contractAddress,
        outputCurrencyId: saveFromToken.symbol == "BNB" ? constant.WHITELIST_TOKENS.BSC.BNB : saveFromToken.symbol == "ETH" ? constant.WHITELIST_TOKENS.ETH.ETH : saveFromToken.contractAddress,
      })
    );

    if (!inputSide){
      setInputSide(true);
      const savefromValue = fromTokenValue;
      setFromTokenValue(toTokenValue);
      setToTokenValue(savefromValue);
    }
    else {
      setInputSide(false);
      const savetoValue = toTokenValue;
      setToTokenValue(fromTokenValue);
      setFromTokenValue(savetoValue);
    }

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

  const handleAutoSlippage = () => {
    if (!autoSlippage) {
      setUserSlippageTolerance(10);
    }

    setAutoSlippage(!autoSlippage);
  }

  const handleFromToken = (value: number) => {
    setInputSide(true);
    setFromTokenValue(value);
  }

  const handleToToken = (value: number) => {
    setInputSide(false);
    setToTokenValue(value);
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
            <p style={{
              color:"#a7a7a7", 
              fontSize:"0.8rem"
            }}>From</p>
            <p style={{
              fontSize:"0.8rem",
              color:textColor
            }}>
              Balance: {maxFromToken.toFixed(5)}
            </p>
          </Box>
          <InputBox
            showMax = {true}
            token = {fromToken}
            setValue = {handleFromToken}
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
          <Box className={style.headerText} style = {{marginBottom:"1rem"}}>
            <p style={{
              color:"#a7a7a7", 
              fontSize:"0.8rem"
            }}>To</p>
            <p style={{
              fontSize:"0.8rem",
              color:textColor
            }}>
              Balance: {maxToToken.toFixed(5)}
            </p>
          </Box>
          <InputBox
            showMax = {false}
            token = {toToken}
            setValue = {handleToToken}
            value = {toTokenValue.toString()}
          ></InputBox>
        </Box>
      </Box>
      <Box 
        className={style.detailsSection}
      >
        <Box className={style.detailSlippage}>
          <p className={style.headerText} style = {{
            marginBottom:"1rem", 
            color:"#a7a7a7", 
            fontSize:"0.8rem"
          }}>Slippage</p>
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
                isDisabled = {autoSlippage}
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
              background = {autoSlippage ? slectedColor : "transparent"}
              onClick = {handleAutoSlippage}
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
        isDisabled = {!showConnect || label == BTN_LABEL.LOADING || label == BTN_LABEL.INSUFFICENT || executing || (label == BTN_LABEL.SWAP && fromTokenValue == 0)}
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