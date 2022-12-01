import React from 'react'
import { Box, Input, Button } from "@chakra-ui/react"
import {images} from "../../config/images"
import style from './TokenList.module.css'

export default function TokenList() {
  return (
    <Box className={style.tokenList}>
      <Input className = {style.tokenSearch} placeholder='Search' />
      <Box className= {style.tokenListInfo}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"40px"}/>
        <Box display={"flex"} flexDirection={"column"} textAlign={"start"}>
          <p>Doge Coin</p>
          <p style={{fontSize:10}}>0xba2ae424....d6c32edc70b295c744c43</p>
        </Box>
        <Button>
          BNB CHAIN
        </Button>
      </Box>
      <Box className= {style.tokenListInfo}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"40px"}/>
        <Box display={"flex"} flexDirection={"column"} textAlign={"start"}>
          <p>Doge Coin</p>
          <p style={{fontSize:10}}>0xba2ae424....d6c32edc70b295c744c43</p>
        </Box>
        <Button>
          BNB CHAIN
        </Button>
      </Box> 
    </Box>
  );
}