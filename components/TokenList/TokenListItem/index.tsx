import React from 'react'
import { 
  BNBIcon, 
  ETHIcon,
  PinIcon,
  UnPinIcon,
  PinLightIcon,
  UnPinLightIcon
} from '../../../assests/icon'
import { Box, Input, Button, useColorModeValue, useColorMode } from "@chakra-ui/react"
import style from './TokenListItem.module.css'
import {makeShortAddress} from '../../../utils'
import { ERC20Token } from '../../../utils/type';

interface TokenListItem {
  tokenData: ERC20Token;
}

export default function TokenListItem({tokenData} : {tokenData?: ERC20Token}) {

  const colorMode = useColorMode();
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");
  
  return(
    <Box className= {style.tokenListInfo} 
      _hover={{bg:hoverColor}}
      backgroundColor={hoverColor}
    >
      <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
        <img src={tokenData?.image} width={"40rem"} />
        <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
          <p className={style.tokenName}>{tokenData?.symbol}</p>
          <p className={style.tokenAddress}>{makeShortAddress(tokenData?.contractAddress!)}</p>
        </Box>
      </Box>
      <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
        <BNBIcon/>
        {
          colorMode.colorMode == "light" ? <UnPinLightIcon/> : <UnPinIcon/>
        }            
      </Box>
    </Box>
  );
}