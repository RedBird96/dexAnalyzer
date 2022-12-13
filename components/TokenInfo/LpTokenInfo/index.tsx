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
import { LPTokenPair } from '../../../utils/type'
import style from './LpTokenInfo.module.css'

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
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const backgroundColor = useColorModeValue("#ffffff","#1C1C1C");
  let hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
  const [clickDex, setClickDex] = useState<number>(0);

  if (showArrow)
    hoverColor = "transparent";

  useEffect(() => {
    setClickDex(0);
  }, [lpToken]);

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
            style={{marginRight:"1rem"}}  
            color={whiteBlackMode}
          >
            { showArrow ?
              numberWithCommasTwoDecimals(lptoken1Reserve / Math.pow(10, lpToken.decimals)) :
              numberWithCommasTwoDecimals(lpToken.token1_reserve / Math.pow(10, lpToken.decimals))
            } 
          </p>
          <p
            className={style.tokenMarketCap} 
            style={{color:"#00B112"}}
          >
            ({
              showArrow ?
              convertBalanceCurrency(lptoken1Reserve / Math.pow(10, lpToken.decimals)) :
              convertBalanceCurrency(lpToken.token1_reserve / Math.pow(10, lpToken.decimals))
            })
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