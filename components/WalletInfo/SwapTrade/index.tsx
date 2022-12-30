import { Box, Button, Circle, Divider, Input, useColorMode, useColorModeValue } from '@chakra-ui/react'
import React, {useEffect, useRef, useState} from 'react'
import style from './SwapTrade.module.css'
import {
  DownArrowDark,
  DownArrowLight,
  SwitchToken
} from "../../../assests/icon"
import InputBox from '../InputBox';
import { ERC20Token } from '../../../utils/type';
import { useLPTokenPrice, useTokenInfo } from '../../../hooks';
import * as constant from '../../../utils/constant'
import { getTokenBalance, getTokenLogoURL } from '../../../api';
import { useAddress, useNetwork } from '@thirdweb-dev/react';

export default function SwapTrade() {

  const {lpTokenPrice} = useLPTokenPrice();
  const address = useAddress();
  const [network, switchNetwork] = useNetwork();
  const {tokenData} = useTokenInfo();
  const colorMode = useColorMode();
  const {lpTokenAddress} = useLPTokenPrice();
  const borderColor = useColorModeValue("#C3C3C3", "#2E2E2E");
  const mainbg = useColorModeValue("#efefef", "#121212");
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const [fromTokenValue, setFromTokenValue] = useState<number>(0);
  const [toTokenValue, setToTokenValue] = useState<number>(0);
  const [maxFromToken, setMaxFromToken] = useState<number>(0);
  const [fromToken, setFromToken] = useState<ERC20Token>(
    {
      name: 'ETH',
      symbol: 'ETH',
      image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
    } as ERC20Token
  );
  const [toToken, setToToken] = useState<ERC20Token>({
    name: 'BNB',
    symbol: 'BNB',
    image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  }as ERC20Token);

  useEffect(() => {

    const setTokens = async() => {

      const fromTokenimg = await getTokenLogoURL(
        lpTokenAddress.quoteCurrency_contractAddress, 
        lpTokenAddress.network, 
        lpTokenAddress.quoteCurrency_name
      );
      const toTokenimg = await getTokenLogoURL(lpTokenAddress.baseCurrency_contractAddress,
        lpTokenAddress.network, 
        lpTokenAddress.baseCurrency_name
      );
      setFromToken({
        name: lpTokenAddress.quoteCurrency_name == "WBNB" ? "BNB" : lpTokenAddress.quoteCurrency_name,
        symbol: lpTokenAddress.quoteCurrency_name == "WBNB" ? "BNB" : lpTokenAddress.quoteCurrency_name,
        image: fromTokenimg,
        network: lpTokenAddress.network,
        contractAddress: lpTokenAddress.quoteCurrency_contractAddress
      } as ERC20Token)

      setToToken( {
        name: lpTokenAddress.baseCurrency_name == "WBNB" ? "BNB" : lpTokenAddress.baseCurrency_name,
        symbol: lpTokenAddress.baseCurrency_name == "WBNB" ? "BNB" : lpTokenAddress.baseCurrency_name,
        image: toTokenimg,
        network: lpTokenAddress.network,
        contractAddress: lpTokenAddress.baseCurrency_contractAddress
      } as ERC20Token)

      if (address != undefined) {
        const bal = await getTokenBalance(
          lpTokenAddress.quoteCurrency_name == "WBNB" ? "BNB" : lpTokenAddress.quoteCurrency_contractAddress,
          address, 
          lpTokenAddress.network
        );
        console.log('bal', bal);
        if (bal != constant.NOT_FOUND_TOKEN) {
          setMaxFromToken(parseFloat(bal));
        }
      }
    }

    if (lpTokenAddress.quoteCurrency_contractAddress != undefined &&
        lpTokenAddress.baseCurrency_contractAddress != undefined
      ){
      setTokens();  
    }

  }, [lpTokenAddress, address]);

  useEffect(() => {
    setToTokenValue(fromTokenValue / lpTokenPrice.tokenPrice);
  }, [fromTokenValue])

  const switchSwapTokens = () => {
    const saveFromToken = fromToken;
    const saveToToken = toToken;
    setToToken(saveFromToken);
    setFromToken(saveToToken);
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
            <Input
            width={"6rem"}
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
            >
            </Input>
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
            <p className = {style.commentText}>0.29BNB</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price Inpact:</p>
            <p className = {style.commentText}>0.29BNB</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price:</p>
            <p className = {style.commentText}>0.29BNB</p>
          </Box>
          <Box style = {{
            display:"flex",
            flexDirection:"row"
          }}>
            <p className = {style.commentText} style= {{ color :"#696969"}}>Price:</p>
            <p className = {style.commentText}>0.29BNB</p>
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
      >
        SWAP
      </Button>
    </Box>
  )
}