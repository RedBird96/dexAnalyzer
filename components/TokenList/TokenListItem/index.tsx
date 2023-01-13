import React, {useEffect, useState} from 'react'
import Image from 'next/image'
import { 
  PinLightIcon,
  UnPinLightIcon,
  SearchCross,
  LightCross
} from '../../../assests/icon'
import { Box, Input, Button, useColorModeValue, useColorMode } from "@chakra-ui/react"
import style from './TokenListItem.module.css'
import {makeShortAddress, makeShortTokenName} from '../../../utils'
import { ERC20Token } from '../../../utils/type'
import * as constant from '../../../utils/constant'
import Link from 'next/link'
import pin from '../../../assests/icon/pin.png'
import unpin from '../../../assests/icon/unpin.png'
import pinlight from '../../../assests/icon/pin_light.png'
import whitepinlight from '../../../assests/icon/whitepin_light.png'
import unpinlight from '../../../assests/icon/unpin_light.png'
import useSize from '../../../hooks/useSize'

const TokenListItem = ({
  tokenData,
  activeToken,
  activeTokenHandler,
  pinTokenHandler,
}:{
  tokenData: ERC20Token,
  activeToken: ERC20Token,
  activeTokenHandler: (x?: any) => void,
  pinTokenHandler: (x?: any, y?:boolean) => void,
}) => {

  const colorMode = useColorMode();
  const nameColor = useColorModeValue("#3b2c2c","#FFFFFF");
  const textColor = useColorModeValue("#3b2c2c","#767676");
  const textColorActive = useColorModeValue("#D7D7D7","#A7A7A7");
  const whiteColor = useColorModeValue("#000000","#FFFFFF");
  const hoverColor = useColorModeValue("#359EFF","#3A3A29");
  const addressColor = useColorModeValue("#6a6a6a","#6a6a6a");
  const addressColorActive  = useColorModeValue("#D7D7D7","#6a6a6a");
  const itemBackcolor = useColorModeValue("#E9F4FF", "#2F2F2F");
  const [isHover, setIsHover] = useState<Boolean>(false);
  const [isActive, setIsActive] = useState<Boolean>(false);
  const windowDimensions = useSize();
  const [showCrossIcon, setShowCrossIcon] = useState<Boolean>(false);
  useEffect(() => {
      setIsActive(activeToken == tokenData);
  }, [activeToken, tokenData]);
  const setPinIcon = () => {
    tokenData.pinSetting = !tokenData.pinSetting;
    setShowCrossIcon(false);
    pinTokenHandler(tokenData, true);
  }
  const setActiveToken = () => {
    activeTokenHandler(tokenData);
  }
  return(
      <Box className= {style.tokenListInfo} 
        _hover={{ bg: hoverColor }}
        onMouseOver={() => {setIsHover(true)}}
        onMouseOut={() => {setIsHover(false)}}
        backgroundColor={isActive ? colorMode.colorMode == "dark" ? hoverColor : "#0085FF" : tokenData.pinSetting ? itemBackcolor : "transparent"}
        color={isActive?"#FFFFFF":whiteColor}
        onMouseMove={() => {
          setShowCrossIcon(true)
        }}
        onMouseLeave={() => setShowCrossIcon(false)}      
      >
        <Box display={"flex"} flexDirection={"row"} alignItems={"center"} width={"90%"} justifyContent={"space-between"}>
          <Link style={{width:"80%"}} href={`/trade/${tokenData.network == constant.ETHEREUM_NETWORK ? "eth" : "bsc"}/${tokenData.contractAddress}`}    >
            <Box 
              style={{display:"flex", flexDirection:"row", alignItems:"center", width:"80%"}}
              onClick={setActiveToken}
            >
              <img src={tokenData?.image} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "30rem" : "40rem"}/>
              <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
                <Box display={"flex"} flexDirection={"row"} >
                  <p className={style.tokenName} style={{color:isActive || isHover ? "#FFFFFF" : nameColor}}>{makeShortTokenName(tokenData?.name, windowDimensions.width < constant.SCREENSM_SIZE ? 7 : 13)}</p>
                  <p className={style.tokenName} style={{color:isActive || isHover ? textColorActive : textColor}}>&nbsp;({makeShortTokenName(tokenData?.symbol, 5)})</p>
                </Box>
                <p className={style.tokenAddress} style ={{color:isActive || isHover ? addressColorActive : addressColor}}>{makeShortAddress(tokenData?.contractAddress!)}</p>
              </Box>
            </Box>
          </Link>
          <Box style={{
            display:"flex", 
            flexDirection:"row", 
            alignItems:"center", 
            justifyContent:"space-between",
            }}
            width = {showCrossIcon?"4.5rem":"3rem"}
          >
            {
              tokenData?.network == constant.ETHEREUM_NETWORK ?
              <img src = {"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"}/>:
              <img src = {"https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"}/>
            }
            <Box onClick={setPinIcon}>
            {
              colorMode.colorMode == "light" ? 
              tokenData?.pinSetting == false ? 
              <Image src = {unpinlight.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/> : 
              isActive ?
              <Image src = {whitepinlight.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/>:
              <Image src = {pinlight.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/>
              : 
              tokenData?.pinSetting == false ? 
                <Image src = {unpin.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/> : 
                <Image src = {pin.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/>
            }    
            </Box>   
            {
              showCrossIcon == true && 
              <Box onClick={()=>pinTokenHandler(tokenData, false)}>
                {
                  isActive ? 
                  <Link href={'/trade'}>
                    {colorMode.colorMode == "dark" ? <SearchCross/> : <LightCross/>}
                  </Link> :
                  colorMode.colorMode == "dark" ? <SearchCross/> : <LightCross/>
                }
              </Box>
            }   
          </Box>  
        </Box>
      </Box>
  );
}

export default TokenListItem;