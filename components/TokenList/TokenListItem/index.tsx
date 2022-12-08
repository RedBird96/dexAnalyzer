import React from 'react'
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

interface TokenListItem {
  tokenData: ERC20Token;
}

export default function TokenListItem({
  triggerHandler,
  tokenData,
  isSelected
}:{
  triggerHandler?: (x?: any) => void,
  tokenData?: ERC20Token,
  isSelected: Boolean
}) {

  const colorMode = useColorMode();
  const whiteColor = useColorModeValue("#000000","#FFFFFF");
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");

  return(
    <Box className= {style.tokenListInfo} 
      _hover={{bg:hoverColor}}
      onClick={triggerHandler}
      backgroundColor={isSelected ? hoverColor:"#transparent"}
      color={isSelected?"#FFFFFF":whiteColor}
    >
      <Box display={"flex"} flexDirection={"row"} alignItems={"center"} width={"90%"} justifyContent={"space-between"}>
        <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
          <img src={tokenData?.image} width={"50rem"} />
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
          {
            colorMode.colorMode == "light" ? <UnPinLightIcon/> : <UnPinIcon/>
          }            
        </Box>
      </Box>
    </Box>
  );
}