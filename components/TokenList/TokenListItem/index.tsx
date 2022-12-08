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
import {makeShortAddress} from '../../../utils'
import { ERC20Token } from '../../../utils/type'
import * as constant from '../../../utils/constant'

const TokenListItem = ({
  tokenData,
  isPined,
  activeToken,
  activeTokenHandler,
  pinTokenHandler,
  unPinTokenHandler,
}:{
  tokenData?: ERC20Token,
  isPined: Boolean,
  activeToken: ERC20Token,
  activeTokenHandler: (x?: any) => void,
  pinTokenHandler: (x?: any) => void,
  unPinTokenHandler: (x?: any) => void,
}) => {

  const colorMode = useColorMode();
  const whiteColor = useColorModeValue("#000000","#FFFFFF");
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const [pinToken, setPinToken] = useState<Boolean>(isPined);
  const [isActive, setIsActive] = useState<Boolean>(false);
  console.log('pin', pinToken, isPined);
  useEffect(() => {
      setIsActive(activeToken == tokenData);
  }, [activeToken, tokenData]);
  const setPinIcon = () => {
    if (!pinToken){   //pin token
      setPinToken(true);
      pinTokenHandler(tokenData);
    } else {          //unpin token
      setPinToken(false);
      unPinTokenHandler(tokenData);
    }
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
            <p className={style.tokenName}>{tokenData?.symbol}</p>
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
            pinToken == false ? <UnPinLightIcon/> : <PinLightIcon/> : 
            pinToken == false ? <UnPinIcon/> : <PinIcon/>
          }    
          </Box>        
        </Box>
      </Box>
    </Box>
  );
}

export default TokenListItem;