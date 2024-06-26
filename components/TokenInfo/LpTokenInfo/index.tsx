import React, {useEffect, useRef, useState} from 'react'
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
  makeShortTokenName,
  numberWithCommasTwoDecimals
} from '../../../utils'
import { LPTokenPair, TokenSide } from '../../../utils/type'
import style from '../TokenInfo.module.css'
import { SCREENMD_SIZE, SCREENNXL_SIZE, SCREENSM_SIZE } from '../../../utils/constant'
import { useStableCoinPrice } from '../../../hooks/useStableCoinPrice'
import useSize from '../../../hooks/useSize'

export default function LpTokenInfo({
  lpToken,
  dropListHandler,
  showArrow,
  setLPTokenHandler,
  isLast,
  lpTokenList,
  marketInfoWidth=1000,
}:{
  lpToken: LPTokenPair,
  dropListHandler: (x?: any) => void,
  showArrow: boolean,
  setLPTokenHandler: (x?: any) => void,
  isLast: boolean,
  lpTokenList: LPTokenPair[],
  marketInfoWidth?: number
}) {

  const {coinPrice} = useStableCoinPrice();
  const colorMode = useColorMode();
  const {tokenData} = useTokenInfo();
  const {lpTokenAddress} = useLPTokenPrice();
  const [reserve, setReserve] = useState<number>(0);
  const [reserveUSD, setReserveUSD] = useState<number>(0);
  const [reserveCurrency, setReserveCurrency] = useState<string>("");
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  let hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
  const infoborderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const backgroundColor = useColorModeValue("#FFFFFF","#182633");
  const [clickDex, setClickDex] = useState<number>(0);
  const [isMobileVersion, setMobileVersion] = useState<boolean>(false);
  const windowDimensions = useSize();

  if (showArrow)
    hoverColor = "transparent";

  useEffect(() => {
    if (windowDimensions.width < SCREENMD_SIZE) {
      setMobileVersion(true);
    } else {
      setMobileVersion(false);
    }
  }, [windowDimensions])

  useEffect(() => {
    const setFunc = async() => {
      setClickDex(0);
      if (showArrow) {
        if (tokenData.contractAddress.toLowerCase() == lpTokenAddress.token0_contractAddress.toLowerCase()) {
          setReserve(lpTokenAddress.token1_reserve);
          setReserveCurrency(lpTokenAddress.token1_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                       lpTokenAddress.token1_contractAddress.toLowerCase() + lpTokenAddress.network);
          if (coin != undefined) {
            setReserveUSD(lpTokenAddress.token1_reserve * coin.price);
          }
        } else {
          setReserve(lpTokenAddress.token0_reserve)
          setReserveCurrency(lpTokenAddress.token0_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                       lpTokenAddress.token0_contractAddress.toLowerCase() + lpTokenAddress.network);
          if (coin != undefined) {
            setReserveUSD(lpTokenAddress.token0_reserve * coin.price);
          }
        }
      } else {
        if (tokenData.contractAddress.toLowerCase() == lpToken.token0_contractAddress.toLowerCase()) {
          setReserve(lpToken.token1_reserve)
          setReserveCurrency(lpToken.token1_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                      lpToken.token1_contractAddress.toLowerCase() + lpToken.network);
          if (coin != undefined) {
            setReserveUSD(lpToken.token1_reserve * coin.price);
          }
        } else {
          setReserve(lpToken.token0_reserve)
          setReserveCurrency(lpToken.token0_name);
          const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                      lpToken.token0_contractAddress.toLowerCase() + lpToken.network);
          if (coin != undefined) {
            setReserveUSD(lpToken.token0_reserve * coin.price);
          }
        }
      }
    }
    if (tokenData != undefined && 
        lpTokenAddress != undefined && 
        lpTokenAddress.ownerToken == tokenData.contractAddress
      ){
      setFunc();
    }
  }, [lpToken, lpTokenAddress.token1_reserve]);

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
      cursor={showArrow ? "":"pointer"}
      backgroundColor={backgroundColor}
    >
      <Box 
        display={"flex"} 
        flexDirection={"column"} 
        width={"100%"} 
        paddingLeft={!showArrow ? windowDimensions.width < SCREENNXL_SIZE ?"2.5rem" :"1rem" :"1rem"}
        paddingTop={showArrow?"0rem":"0.5rem"}
        paddingBottom={showArrow?"0rem":"0.5rem"}
        _hover={{bg:hoverColor}} 
        onClick={()=> {setLPTokenHandler(lpToken)}}
        marginRight={windowDimensions.width < SCREENNXL_SIZE ? "3rem" : "0rem"}
      >
        <p className={style.marketCap} style={{color:textColor}}>{isMobileVersion ? `${makeShortTokenName(lpToken.baseCurrency_name, 6)}/${makeShortTokenName(lpToken.quoteCurrency_name, 6)}` :lpToken.symbol}&nbsp;(LP)</p>
        <Box _hover={{"textDecoration":"underline"}} 
              cursor="pointer"
        >
          <a style={{display:"flex", flexDirection: "row", alignItems:"center"}}
              href={lpToken.pairContractURL}
              target="_blank"
              rel="noreferrer noopener"
          >
            <p
              className={style.itemvalue} 
              style={{marginRight:"0.2rem"}}  
              color={whiteBlackMode}
            >
              {isMobileVersion ? makeShortTokenName(numberWithCommasTwoDecimals(reserve, 2), 13): numberWithCommasTwoDecimals(reserve, 2)} 
            </p>
            <p
              className={style.itemvalue} 
              style={{marginRight:"0.5rem"}}  
              color={whiteBlackMode}
            >
              {reserveCurrency}
            </p>
            {
              marketInfoWidth > 370 &&
              <p
                className={style.itemvalue} 
                style={{color:"#00B112"}}
              >
                ({isMobileVersion ? makeShortTokenName(convertBalanceCurrency(reserveUSD, 0), 13) : convertBalanceCurrency(reserveUSD, 0)})
              </p>
            }
          </a>
        </Box>
      </Box>
      {
        showArrow && lpTokenList.length > 0 ?
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
        : lpTokenList.length > 1 ?
        <div style={{
          width:"90%",
          borderWidth:isLast?"0":"thin",
          borderColor:infoborderColorMode,
        }}/> :
        <div></div>
      }
    </Box>
    )
}