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
import { useTokenInfo } from '../../../hooks';
import * as constant from '../../../utils/constant'

export default function SwapTrade() {

  const {tokenData} = useTokenInfo();
  const colorMode = useColorMode();
  const mainbg = useColorModeValue("#FFFFFF", "#121212");
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


  return (
    <Box 
      className={style.tradeMain}
    >
      <Box 
        className={style.tradeInputSection}
      >
        <Box className={style.inputBlock}>
          <p className={style.headerText} style = {{marginBottom:"1rem"}}>From</p>
          <InputBox
            showMax = {true}
            token = {fromToken}
          ></InputBox>
        </Box>
        <Box
          display = {"flex"}
          justifyContent = {"center"}
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
            <Divider orientation="vertical"/>
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
      >
        SWAP
      </Button>
    </Box>
  )
}