import React, {useEffect, useState} from 'react'
import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react"
import {
  DownArrowDark,
  DownArrowLight,
} from "../../../assests/icon"
import {
  useTokenInfo,
  useLPTokenPrice
} from '../../../hooks'
import { 
  convertBalanceCurrency,
  numberWithCommasTwoDecimals
} from '../../../utils'
import { LPTokenPair, TokenSide } from '../../../utils/type'
import style from './LpTokenInfo.module.css'
import { getTokenPricefromllama } from '../../../api'
import { NOT_FOUND_TOKEN } from '../../../utils/constant'
import { useStableCoinPrice } from '../../../hooks/useStableCoinPrice'

export default function LpTokenInfo({
  lpToken,
  dropListHandler,
  showArrow,
  setLPTokenHandler,
  isLast,
}:{
  lpToken: LPTokenPair,
  dropListHandler: (x?: any) => void,
  showArrow: boolean,
  setLPTokenHandler: (x?: any) => void
  isLast: boolean
}) {

  const {coinPrice} = useStableCoinPrice();
  const colorMode = useColorMode();
  const {tokenData} = useTokenInfo();
  const {lpTokenAddress} = useLPTokenPrice();
  const [reserve, setReserve] = useState<number>(0);
  const [reserveUSD, setReserveUSD] = useState<number>(0);
  const [reserveCurrency, setReserveCurrency] = useState<string>("");
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const backgroundColor = useColorModeValue("#ffffff","#1C1C1C");
  let hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
  const infoborderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const [clickDex, setClickDex] = useState<number>(0);

  if (showArrow)
    hoverColor = "transparent";

  useEffect(() => {
    const setFunc = async() => {
      setClickDex(0);
      if (showArrow) {
        if (tokenData.contractAddress.toLowerCase() == lpTokenAddress.token0_contractAddress.toLowerCase()) {
          setReserve(lpTokenAddress.token1_reserve);
          setReserveCurrency(lpTokenAddress.token1_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                       lpTokenAddress.token1_contractAddress + lpTokenAddress.network);
          if (coin != undefined) {
            setReserveUSD(lpTokenAddress.token1_reserve * coin.price);
          }
        } else {
          setReserve(lpTokenAddress.token0_reserve)
          setReserveCurrency(lpTokenAddress.token0_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                       lpTokenAddress.token0_contractAddress + lpTokenAddress.network);
          if (coin != undefined) {
            setReserveUSD(lpTokenAddress.token0_reserve * coin.price);
          }
        }
      } else {
        if (tokenData.contractAddress.toLowerCase() == lpToken.token0_contractAddress.toLowerCase()) {
          setReserve(lpToken.token1_reserve)
          setReserveCurrency(lpToken.token1_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                      lpToken.token1_contractAddress + lpToken.network);
          if (coin != undefined) {
            setReserveUSD(lpToken.token1_reserve * coin.price);
          }
        } else {
          setReserve(lpToken.token0_reserve)
          setReserveCurrency(lpToken.token0_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                      lpToken.token0_contractAddress + lpToken.network);
          if (coin != undefined) {
            setReserveUSD(lpToken.token0_reserve * coin.price);
          }
        }
      }
    }
    if (lpTokenAddress.ownerToken == tokenData.contractAddress){
      setFunc();
    }
  }, [lpToken, lpTokenAddress.token0_reserve]);

  const setDexDropShow = () => {
    const count = clickDex+1;
    setClickDex(count);
    dropListHandler(count);
  }

  return (
    <Box 
      display={"flex"} 
      flexDirection={showArrow ? "row" : "column"} 
      width={"100%"} 
      justifyContent={"space-between"} 
      alignItems={"center"} 
      paddingRight={showArrow?"1rem":"0rem"}
      backgroundColor={showArrow?"transparent":backgroundColor}
      cursor={showArrow ? "":"pointer"}
    >
      <Box 
        display={"flex"} 
        flexDirection={"column"} 
        width={"100%"} 
        paddingLeft={"1rem"}
        paddingTop={showArrow?"0rem":"0.5rem"}
        paddingBottom={showArrow?"0rem":"0.5rem"}
        _hover={{bg:hoverColor}} 
        onClick={()=> {setLPTokenHandler(lpToken)}}
      >
        <p className={style.marketCap} style={{color:textColor}}>{lpToken.symbol}&nbsp;(LP)</p>
        <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
          <p 
            className={style.tokenMarketCap} 
            style={{marginRight:"0.2rem"}}  
            color={whiteBlackMode}
          >
            {numberWithCommasTwoDecimals(reserve, 2)} 
          </p>
          <p
            className={style.tokenMarketCap} 
            style={{marginRight:"0.5rem"}}  
            color={whiteBlackMode}
          >
            {reserveCurrency}
          </p>
          <p
            className={style.tokenMarketCap} 
            style={{color:"#00B112"}}
          >
            ({convertBalanceCurrency(reserveUSD, 0)})
          </p>
        </Box>
      </Box>
      {
        showArrow ?
        <Box
          cursor={"pointer"} 
          style={{transform:`rotate(${clickDex * 180}deg)`, width:"1rem"}} 
          onClick={setDexDropShow}
        >
          {colorMode.colorMode == "dark" ?
            <DownArrowDark/> :
            <DownArrowLight/> 
          }
        </Box>
        :   
        <div style={{
          width:"90%",
          borderWidth:isLast?"0":"thin",
          borderColor:infoborderColorMode,
        }}/>
      }
    </Box>
    )
}