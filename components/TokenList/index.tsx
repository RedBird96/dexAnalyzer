import React from 'react'
import { Box, Input, Button, useColorModeValue } from "@chakra-ui/react"
import { BNBIcon } from '../../assests/icon';
import style from './TokenList.module.css'

export default function TokenList() {
  const listClass = useColorModeValue(
    style.tokenList + " " + style.tokenListLight,
    style.tokenList + " " + style.tokenListDark
  );
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const searchClass = useColorModeValue(
    style.tokenSearch + " " + style.tokenSearchLight,
    style.tokenSearch + " " + style.tokenSearchDark,
  );

  return (
    <Box className={listClass}>
      <Input className = {searchClass} placeholder='Search' />
      <Box className= {style.tokenListInfo} _hover={{
        bg:hoverColor
      }}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"55px"}/>
        <Box display={"flex"} flexDirection={"column"} textAlign={"start"}>
          <p className={style.tokenName}>Doge Coin</p>
          <p className={style.tokenAddress} style={{fontSize:10}}>0xba2ae424d960c26247dd6c32edc70b295c744c43</p>
        </Box>
        <Button
          style={{border:"0.5px", borderRadius: "25px"}}
          color={"#EEB500"}
        >
          <BNBIcon/>
          <p style={{marginLeft:"5px"}}>BNB CHAIN</p>
        </Button>
      </Box>
      <Box className= {style.tokenListInfo} _hover={{
        bg:hoverColor
      }}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"55px"}/>
        <Box display={"flex"} flexDirection={"column"} textAlign={"start"}>
          <p className={style.tokenName} >Doge Coin</p>
          <p className={style.tokenAddress} style={{fontSize:10}}>0xba2ae424d960c26247dd6c32edc70b295c744c43</p>
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