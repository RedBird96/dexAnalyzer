import React from 'react'
import { Box, Switch, useColorMode  } from "@chakra-ui/react"
import {images} from "../../config/images"
import {
  WebSite,
  FaceBook,
  Twitter
} from "../../assests/icon"
import style from './TokenInfo.module.css'

export default function TokenInfo() {
  const { colorMode } = useColorMode()
  const dark = style.tokenInfo + " " + style.tokenInfoDark;
  const light = style.tokenInfo + " " + style.tokenInfoLight;

  return (
    <Box className={colorMode == "light" ? light : dark}>
      <nav><hr aria-orientation='horizontal'/></nav>
      <Box className={style.tokenSocialInfo}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"60px"}/>
        <Box display={"flex"} flexDirection={"row"} marginLeft={"1rem"}>
          <Box display={"flex"} flexDirection={"column"} marginRight={"1rem"}>
            <p className={style.tokenName}>Doge Coin</p>
            <p className={style.tokenBalance}>Balance:</p>
          </Box>
          <Box display={"flex"} flexDirection={"column"}>
            <p className={style.tokenPrice}>$0.1800345029</p>
            <p className={style.tokenBlance}>59,034,543,124 ($ 765,825)</p>            
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
        <Box display={"flex"} flexDirection={"row"} margin={"0.5rem 1rem 0.5rem 1rem"}>
          <Box display={"flex"} flexDirection={"column"}>
            <p className={style.totalSupply}>Total Supply</p>
            <p className={style.tokenTotalSupply}>100,000,000,000,000,000,000,000,000,000,000,000,000</p>
            <p className={style.marketCap}>Market Cap</p>
            <p className={style.tokenMarketCap}>$365,825,830</p>
          </Box>
          <Box display={"flex"} flexDirection={"column"} marginLeft={"3rem"}>
            <p className={style.tokenLPName}>Doge Coin/BNB (LP)</p>
            <p className={style.tokenBNBAmount}>5439 BNB ($75,325,830)</p>
            <p className={style.tokenLPTokenHolder}>LP Token Holders</p>
          </Box>      
          <Box className={style.tokenContract} display={"flex"} flexDirection={"column"} marginLeft={"3rem"}>
            <p style={{marginBottom:"5px"}}>DOGE Contract</p>
            <p style={{marginBottom:"5px"}}>DOGE Holders</p>
            <p style={{marginBottom:"5px"}}>DOGE Transactions</p>
            <Switch id='Show Trades'>Show Trade</Switch>
          </Box>       
        </Box>
      </nav>
    </Box>
  );
}