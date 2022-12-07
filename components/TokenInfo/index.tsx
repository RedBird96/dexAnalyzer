import React, {useState, useEffect} from 'react'
import { Box, Switch, useColorModeValue  } from "@chakra-ui/react"
import {BigNumber} from 'bignumber.js'
import {
  WebSite,
  FaceBook,
  Twitter,
  CopyAddressIcon
} from "../../assests/icon"
import {
  useTokenInfo
} from '../../hooks/useTokenInfo'
import { 
  convertBalanceCurrency,
  numberWithCommasTwoDecimals,
  numberWithCommasNoDecimals
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

  const infoborderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
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
  return (
    <Box className={infoClass}>
      <Box className={style.tokenSocialInfo}>
        <Box display={"flex"} flexDirection={"row"} width={"83%"} alignItems={"center"}>
          <Box display={"flex"} flexDirection={"row"} width={"59%"} alignItems={"center"}>
            <img src={tokenData.image} width={"38rem"}/>
            <Box display={"flex"} flexDirection={"column"} paddingLeft={"0.6rem"}>
              <Box display={"flex"} flexDirection={"row"}>
                <p className={style.tokenName}>{tokenData.name}</p>
                <p className={style.tokenPrice}>{convertBalanceCurrency(tokenData.price)}</p>
              </Box>
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
                <p className={style.tokenAddress}>{tokenData.contractAddress}</p>
                <CopyAddressIcon cursor={"pointer"}/>
              </Box>            
            </Box>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
          >
            <WebSite className={style.socialUrl}/>
            <FaceBook className={style.socialUrl}/>
            <Twitter className={style.socialUrl}/>
          </Box>
        </Box>
        <div className={style.border} style={{borderColor:infoborderColorMode}}/>
        <Box
         display={"flex"}
         flexDirection={"row"}
         alignItems={"center"}
         width={"25%"}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}         
          >
            <p className={style.totalSupply}>Total Supply</p>
            <p className={style.tokenTotalSupply}>{numberWithCommasNoDecimals(BigInt(tokenData.totalSupply))}</p>
          </Box>
        </Box>
      </Box>
      <nav>
        <hr aria-orientation='horizontal'></hr>
      </nav>
      <Box className={style.tokenMarktetInfo} alignItems={"center"}>
        <Box display={"flex"} flexDirection={"row"} width={"83%"} height={"100%"} alignItems={"center"}>
          <Box display={"flex"} flexDirection={"column"} width={"28%"} paddingLeft={"3.2rem"}>
            <p className={style.marketCap}>Market Cap</p>
            <p className={style.tokenMarketCap}>{convertBalanceCurrency(parseFloat(tokenData.marketCap))}</p>
          </Box>
          <div className={style.border} style={{borderColor:infoborderColorMode}}/>
          <Box display={"flex"} flexDirection={"column"} width={"27%"} >
            <p className={style.marketCap}>UNI / BNB (LP)</p>
            <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
              <p className={style.itemvalue} color={whiteBlackMode} style={{marginRight:"1rem"}}>{numberWithCommasTwoDecimals(parseFloat(tokenData.marketCap))}</p>
              <p className={style.tokenMarketCap}>({convertBalanceCurrency(tokenData.balance! * tokenData.price)})</p>
            </Box>
          </Box>
          <div className={style.border} style={{borderColor:infoborderColorMode}}/>
          <Box display={"flex"} flexDirection={"column"} width={"39%"}>
              <p className={style.marketCap}>Balance</p>
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
                <p className={style.itemvalue} color={whiteBlackMode} style={{marginRight:"1rem"}}>{numberWithCommasTwoDecimals(tokenData.balance)}</p>
                <p className={style.tokenMarketCap}>({convertBalanceCurrency(tokenData.balance! * tokenData.price)})</p>
              </Box>
          </Box>          
        </Box>
        <div className={style.border} style={{borderColor:infoborderColorMode}}/>
        <Box display={"flex"} flexDirection={"row"} width={"25%"} alignItems={"center"}>
          <Box display={"flex"} flexDirection={"row"} width={"100%"}>
            <Box display={"flex"} flexDirection={"column"} width={"50%"}>
              <p className={style.marketCap}>Holders</p>
              <p className={style.itemvalue} color={whiteBlackMode}>{tokenData.holdersCount}</p>
            </Box>
            <Box>
              <p className={style.marketCap}>Transactions</p>
              <p className={style.itemvalue} color={whiteBlackMode}>{tokenData.holdersCount}</p>
            </Box>              
          </Box>        
        </Box>
      </Box>
      <nav>
        <hr aria-orientation='horizontal'></hr>
      </nav>
      <Box 
        display={"flex"}
        flexDirection={"row"}
        padding={"0.5rem 0rem 0.5rem 1rem"}
        width={"100%"}
        height={"1.8rem"}
      >
        <Box
          display={"flex"}
          width={"83%"}
          alignItems={"center"}
          justifyContent={"right"}
          paddingRight={"1rem"}
        >
          <Switch className={style.switch}>Show Trade</Switch>
        </Box>
        <div style={{
          height:"90%",
          borderWidth:"1px",
          borderColor:infoborderColorMode,
          marginRight:"1rem"
        }}/>
        <Box
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}   
          width={"25%"}
        >
          <Box className={style.itemvalue} width={"50%"}>
            <p color={whiteBlackMode}>Buy 5%</p>
          </Box>
          <Box className={style.itemvalue} width={"50%"}>
            <p color={whiteBlackMode}>Sell 5%</p>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}