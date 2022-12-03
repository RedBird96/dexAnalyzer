import React, {useState, useEffect} from 'react'
import { Box, Switch, useColorModeValue  } from "@chakra-ui/react"
import {
  WebSite,
  FaceBook,
  Twitter
} from "../../assests/icon"
import {
  useTokenInfo
} from '../../utils/useTokenInfo'
import { 
  convertBalanceCurrency,
  numberWithCommasTwoDecimals
} from '../../utils'
import style from './TokenInfo.module.css'

export default function TokenInfo() {

  const {tokenData} = useTokenInfo();
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);

  const infoClass = useColorModeValue(
    style.tokenInfo + " " + style.tokenInfoLight,
    style.tokenInfo + " " + style.tokenInfoDark
  );

  useEffect(() => {
    let balance_temp = 0;
    let balanceUSD_temp = 0;
    if (tokenData.decimals != 0 && tokenData.balance != 0) {
      balance_temp = tokenData.balance! / Math.pow(10, tokenData.decimals);
      balanceUSD_temp = balance_temp * tokenData.price;
    }
    setBalance(balance_temp);
    setBalanceUSD(balanceUSD_temp);
  }, [tokenData])
  console.log('tokenData', tokenData);
  
  return (
    <Box className={infoClass}>
      <Box className={style.tokenSocialInfo}>
        <Box display={"flex"} flexDirection={"row"} width={"50%"} alignItems={"center"}>
          <img src={tokenData.image} width={"60px"}/>
          <Box display={"flex"} flexDirection={"column"} padding={"1rem"}>
            <p className={style.tokenName}>{tokenData.name}</p>
            <p className={style.tokenBalance}>Balance:</p>
          </Box>
          <Box display={"flex"} flexDirection={"column"}>
            <p className={style.tokenPrice}>{convertBalanceCurrency(tokenData.price)}</p>
            <div style={{display:"flex", flexDirection:"row"}}>
              <p className={style.tokenBlance}>{numberWithCommasTwoDecimals((balance))}</p>            
              <p className={style.tokenBlance} style={{color:"#00B112"}}>({convertBalanceCurrency(balanceUSD)})</p>
            </div>
          </Box>
        </Box>
        <Box
         display={"flex"}
         flexDirection={"row"}
         alignItems={"center"}
         width={"50%"}
        >
          <WebSite className={style.socialUrl}/>
          <FaceBook className={style.socialUrl}/>
          <Twitter className={style.socialUrl}/>
        </Box>
      </Box>
      <nav>
        <hr aria-orientation='horizontal'></hr>
      </nav>
      <Box className={style.tokenMarktetInfo}>
        <Box display={"flex"} flexDirection={"column"} width={"50%"}>
          <p className={style.totalSupply}>Total Supply</p>
          <p className={style.tokenTotalSupply}>{numberWithCommasTwoDecimals(parseFloat(tokenData.totalSupply))}</p>
          <p className={style.marketCap}>Market Cap</p>
          <p className={style.tokenMarketCap}>{convertBalanceCurrency(parseFloat(tokenData.marketCap))}</p>
        </Box>
        <Box display={"flex"} flexDirection={"row"} width={"50%"}>
          <Box display={"flex"} flexDirection={"column"} width={"50%"}>
            <p className={style.tokenLPName}>Doge Coin/BNB (LP)</p>
            <div style={{display:"flex", flexDirection:"row"}}>
              <p className={style.tokenBNBAmount}>5439 BNB</p>
              <p className={style.tokenBNBAmount} style={{color:"#00B112"}}>($75,325,830)</p>
            </div>
            <p className={style.tokenLPTokenHolder}>LP Token Holders</p>
          </Box>      
          <Box className={style.tokenContract} display={"flex"} flexDirection={"column"} marginLeft={"3rem"} width={"50%"}>
            <p style={{marginBottom:"5px"}}>DOGE Contract</p>
            <p style={{marginBottom:"5px"}}>DOGE Holders</p>
            <p style={{marginBottom:"5px"}}>DOGE Transactions</p>
            <Switch id='Show Trades'>Show Trade</Switch>
          </Box>       
        </Box>
      </Box>
    </Box>
  );
}