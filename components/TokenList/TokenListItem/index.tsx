import React, {useEffect, useState} from 'react'
import { 
  BNBIcon, 
  ETHIcon,
  PinIcon,
  UnPinIcon,
  PinLightIcon,
  UnPinLightIcon
} from '../../../assests/icon'
import {
  useTokenInfo
} from '../../../hooks'
import { Box, Input, Button, useColorModeValue, useColorMode } from "@chakra-ui/react"
import style from './TokenListItem.module.css'
import {makeShortAddress, makeShortTokenName} from '../../../utils'
import { ERC20Token } from '../../../utils/type'
import * as constant from '../../../utils/constant'

const TokenListItem = ({
  tokenData,
  activeToken,
  activeTokenHandler,
  pinTokenHandler,
}:{
  tokenData: ERC20Token,
  activeToken: ERC20Token,
  activeTokenHandler: (x?: any) => void,
  pinTokenHandler: (x?: any) => void,
}) => {

  const colorMode = useColorMode();
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const whiteColor = useColorModeValue("#000000","#FFFFFF");
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const [isActive, setIsActive] = useState<Boolean>(false);
  useEffect(() => {
      setIsActive(activeToken == tokenData);
  }, [activeToken, tokenData]);
  const setPinIcon = () => {
    tokenData.pinSetting = !tokenData.pinSetting;
    pinTokenHandler(tokenData);
  }
  const setActiveToken = () => {
    activeTokenHandler(tokenData);
  }
  return(
    <Box className= {style.tokenListInfo} 
      _hover={{bg:hoverColor}}
      onClick={setActiveToken}
      backgroundColor={isActive ? hoverColor:"#transparent"}
      color={isActive?"#FFFFFF":whiteColor}
    >
      <Box display={"flex"} flexDirection={"row"} alignItems={"center"} width={"90%"} justifyContent={"space-between"}>
        <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
          <img src={tokenData?.image} width={"50rem"}/>
          <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
            <Box display={"flex"} flexDirection={"row"} >
              <p className={style.tokenName}>{makeShortTokenName(tokenData?.name, 10)}</p>
              <p className={style.tokenName} style={{color:textColor}}>&nbsp;({makeShortTokenName(tokenData?.symbol, 4)})</p>
            </Box>
            <p className={style.tokenAddress}>{makeShortAddress(tokenData?.contractAddress!)}</p>
          </Box>
        </Box>
        <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
          {
            tokenData?.network == constant.ETHEREUM_NETWORK ?
            <ETHIcon/> :
            <BNBIcon/>
          }
          <Box onClick={setPinIcon}>
          {
            colorMode.colorMode == "light" ? 
            tokenData?.pinSetting == false ? <UnPinLightIcon/> : <PinLightIcon/> : 
            tokenData?.pinSetting == false ? <UnPinIcon/> : <PinIcon/>
          }    
          </Box>        
        </Box>
      </Box>
    </Box>
  );
}

export default TokenListItem;