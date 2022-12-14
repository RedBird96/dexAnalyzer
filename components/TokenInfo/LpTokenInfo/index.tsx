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
import { getTokenPricefromCoingeckoAPI } from '../../../api'

export default function LpTokenInfo({
  lpToken,
  dropListHandler,
  showArrow,
  setLPTokenHandler,
}:{
  lpToken: LPTokenPair,
  dropListHandler: (x?: any) => void,
  showArrow: boolean,
  setLPTokenHandler: (x?: any) => void
}) {

  const colorMode = useColorMode();
  const {tokenData} = useTokenInfo();
  const {lptoken0Reserve, lptoken1Reserve, lpTokenAddress} = useLPTokenPrice();
  const [reserve, setReserve] = useState<number>(0);
  const [reserveUSD, setReserveUSD] = useState<number>(0);
  const [reserveCurrency, setReserveCurrency] = useState<string>("");
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const backgroundColor = useColorModeValue("#ffffff","#1C1C1C");
  let hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
  const [clickDex, setClickDex] = useState<number>(0);

  if (showArrow)
    hoverColor = "transparent";

  useEffect(() => {
    const setFunc = async() => {
      setClickDex(0);
      if (showArrow) {
        if (lpTokenAddress.tokenside == TokenSide.token0) {
          setReserve(lptoken1Reserve)
          setReserveCurrency(lpTokenAddress.token1_name);
          if (lpTokenAddress.token1_contractAddress != undefined && lpTokenAddress.token1_contractAddress != "") {
            const res = await getTokenPricefromCoingeckoAPI(lpTokenAddress.token1_contractAddress, tokenData.network);
            if (res != undefined) {
              const price = res[lpTokenAddress.token1_contractAddress].usd;
              setReserveUSD(lptoken1Reserve * price);
            }
          }
        } else {
          setReserve(lptoken0Reserve)
          setReserveCurrency(lpTokenAddress.token0_name);
          if (lpTokenAddress.token0_contractAddress != undefined && lpTokenAddress.token0_contractAddress != "") {
            const res = await getTokenPricefromCoingeckoAPI(lpTokenAddress.token0_contractAddress, tokenData.network);
            if (res != undefined) {
              const price = res[lpTokenAddress.token0_contractAddress].usd;
              setReserveUSD(lptoken0Reserve * price);
            }
          }
        }
      } else {
        if (lpToken.tokenside == TokenSide.token0) {
          setReserve(lpToken.token1_reserve)
          setReserveCurrency(lpToken.token1_name);
          if (lpToken.token1_contractAddress != undefined && lpToken.token1_contractAddress != "") {
            const res = await getTokenPricefromCoingeckoAPI(lpToken.token1_contractAddress, tokenData.network);
            if (res != undefined) {
              const price = res[lpToken.token1_contractAddress].usd;
              setReserveUSD(lpToken.token1_reserve * price);
            }
          }
        } else {
          setReserve(lpToken.token0_reserve)
          setReserveCurrency(lpToken.token0_name);
          if (lpToken.token0_contractAddress != undefined && lpToken.token0_contractAddress != "") {
            const res = await getTokenPricefromCoingeckoAPI(lpToken.token0_contractAddress, tokenData.network);
            if (res != undefined) {
              const price = res[lpToken.token0_contractAddress].usd;
              setReserveUSD(lpToken.token0_reserve * price);
            }
          }
        }
      }
    }
    setFunc();
  }, [lpToken, lptoken0Reserve, lptoken1Reserve]);

  const setDexDropShow = () => {
    const count = clickDex+1;
    setClickDex(count);
    dropListHandler(count);
  }

  return (
    <Box 
      display={"flex"} 
      flexDirection={"row"} 
      width={"100%"} 
      justifyContent={"space-between"} 
      alignItems={"center"} 
      paddingRight={"0.5rem"}
      backgroundColor={showArrow?"transparent":backgroundColor}
      cursor={showArrow ? "":"pointer"}
      zIndex={"99"}
    >
      <Box 
        display={"flex"} 
        flexDirection={"column"} 
        width={"100%"} 
        _hover={{bg:hoverColor}} 
        onClick={()=> {setLPTokenHandler(lpToken)}}>
        <p className={style.marketCap} style={{color:textColor}}>{lpToken.symbol}</p>
        <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
          <p 
            className={style.tokenMarketCap} 
            style={{marginRight:"0.2rem"}}  
            color={whiteBlackMode}
          >
            {numberWithCommasTwoDecimals(reserve)} 
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
            ({convertBalanceCurrency(reserveUSD)})
          </p>
        </Box>
      </Box>
      {
        showArrow &&
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
      }
    </Box>
    )
}