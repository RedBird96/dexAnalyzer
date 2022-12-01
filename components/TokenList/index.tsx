import React from 'react'
import { Box, Input, Button, useColorMode } from "@chakra-ui/react"
import { BNBIcon } from '../../assests/icon';
import style from './TokenList.module.css'

export default function TokenList() {
  const { colorMode } = useColorMode()
  const dark = style.tokenList + " " + style.tokenListDark;
  const light = style.tokenList + " " + style.tokenListLight;

  return (
    <Box className={colorMode=="light"?light:dark}>
      <Input className = {style.tokenSearch} placeholder='Search' />
      <Box className= {style.tokenListInfo}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"50px"}/>
        <Box display={"flex"} flexDirection={"column"} textAlign={"start"}>
          <p className={style.tokenName}>Doge Coin</p>
          <p className={style.tokenAddress} style={{fontSize:10}}>0xba2ae424....d6c32edc70b295c744c43</p>
        </Box>
        <Button
          style={{border:"0.5px", borderRadius: "25px"}}
          color={"#EEB500"}
        >
          <BNBIcon/>
          <p style={{marginLeft:"5px"}}>BNB CHAIN</p>
        </Button>
      </Box>
      <Box className= {style.tokenListInfo}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"50px"}/>
        <Box display={"flex"} flexDirection={"column"} textAlign={"start"}>
          <p className={style.tokenName} >Doge Coin</p>
          <p className={style.tokenAddress} style={{fontSize:10}}>0xba2ae424....d6c32edc70b295c744c43</p>
        </Box>
        <Button
          style={{border:"0.5px", borderRadius: "25px"}}
          color={"#EEB500"}
        >
          <BNBIcon/>
          <p style={{marginLeft:"5px"}}>BNB CHAIN</p>
        </Button>
      </Box> 
    </Box>
  );
}