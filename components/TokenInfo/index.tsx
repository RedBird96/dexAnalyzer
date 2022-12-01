import React from 'react'
import { Box, Switch  } from "@chakra-ui/react"
import {images} from "../../config/images"
import {
  WebSite,
  FaceBook,
  Twitter
} from "../../assests/icon"
import style from './TokenInfo.module.css'

export default function TokenInfo() {
  return (
    <Box className={style.tokenInfo}>
      <Box className={style.tokenSocialInfo}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"60px"}/>
        <Box display={"flex"} flexDirection={"row"} marginLeft={"1rem"}>
          <Box display={"flex"} flexDirection={"column"} marginRight={"1rem"}>
            <p>Doge Coin</p>
            <p>Balance:</p>
          </Box>
          <Box display={"flex"} flexDirection={"column"}>
            <p>$0.1800345029</p>
            <p>59,034,543,124 ($ 765,825)</p>            
          </Box>          
        </Box>
        <Box
         display={"flex"}
         flexDirection={"row"}
         marginLeft={"3rem"}
         alignItems={"center"}
        >
          <WebSite className={style.socialUrl}/>
          <FaceBook className={style.socialUrl}/>
          <Twitter className={style.socialUrl}/>
        </Box>
      </Box>
      <nav>
        <hr aria-orientation='horizontal'></hr>
        <Box display={"flex"} flexDirection={"row"} marginLeft={"1rem"}>
          <Box display={"flex"} flexDirection={"column"}>
            <p>Total Supply</p>
            <p>100,000,000,000,000,000,000,000,000,000,000,000,000</p>
            <p>Market Cap</p>
            <p>$365,825,830</p>
          </Box>
          <Box display={"flex"} flexDirection={"column"} marginLeft={"3rem"}>
            <p>Doge Coin/BNB (LP)</p>
            <p>5439 BNB ($75,325,830)</p>
            <p>LP Token Holders</p>
          </Box>      
          <Box display={"flex"} flexDirection={"column"} marginLeft={"3rem"}>
            <p>DOGE Contract</p>
            <p>DOGE Holders</p>
            <p>DOGE Transactions</p>
            <Switch id='Show Trades'>Show Trade</Switch>
          </Box>       
        </Box>
      </nav>
    </Box>
  );
}