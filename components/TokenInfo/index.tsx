import React, {useState, useEffect} from 'react'
import { Box, Switch, useColorMode, useColorModeValue  } from "@chakra-ui/react"
import {BigNumber} from 'bignumber.js'
import {
  WebSite,
  FaceBook,
  Twitter,
  CopyAddressIconDark,
  CopyAddressIconLight,
} from "../../assests/icon"
import {
  useTokenInfo
} from '../../hooks/useTokenInfo'
import {ERC20Token} from '../../utils/type'
import { 
  convertBalanceCurrency,
  numberWithCommasTwoDecimals
} from '../../utils'
import {
  getTokenInfofromCoingeckoAPI,
  getTokenInfoFromWalletAddress
} from '../../api'
import style from './TokenInfo.module.css'
import * as constant from '../../utils/constant'

export default function TokenInfo() {

  const colorMode = useColorMode();
  const {tokenData, setTokenData} = useTokenInfo();
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);

  const [holdersCount, setHoldersCount] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const infoClass = useColorModeValue(
    style.tokenInfo + " " + style.tokenInfoLight,
    style.tokenInfo + " " + style.tokenInfoDark
  );

  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const infoborderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
  const  setTokenInfo = async() => {
    if (tokenData.network == constant.ETHEREUM_NETWORK) {
      const res = await getTokenInfoFromWalletAddress(tokenData.contractAddress);
      if (res != constant.NOT_FOUND_TOKEN) {
        const holdersCount = res['holdersCount'];
        const transferCount = res['transfersCount'];
        setHoldersCount(holdersCount);
        setTransactionCount(transferCount);
      }
    } else {
      setHoldersCount(0);
      setTransactionCount(0);
    }
    // const obj = await getTokenInfofromCoingeckoAPI(
    //   contractAddress, 
    //   tokenData.network == constant.ETHEREUM_NETWORK ? "ethereum" : "binance"
    // );
    // if (obj == undefined)
    //   return;
    // tokenData.totalSupply = obj.market_data.total_supply;
    // tokenData.website = obj.ico_data.links.web;
    // tokenData.twitter = obj.ico_data.links.twitter;
    // tokenData.facebook = obj.ico_data.links.facebook;
    // console.log('totalSupply', tokenData.totalSupply);

  }
  useEffect(() => {
    setTokenInfo();
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
            <img src={tokenData.image} width={"50rem"}/>
            <Box display={"flex"} flexDirection={"column"} paddingLeft={"1rem"}>
              <Box display={"flex"} flexDirection={"row"}>
                <p className={style.tokenName}>{tokenData.symbol}</p>
                <p className={style.tokenPrice}>{convertBalanceCurrency(tokenData.price)}</p>
              </Box>
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"} justifyContent={"center"}>
                <p className={style.tokenAddress} style={{color:textColor}}>{tokenData.contractAddress}</p>
                {colorMode.colorMode == "dark" ?
                <CopyAddressIconDark cursor={"pointer"}/> :
                <CopyAddressIconLight cursor={"pointer"}/> }
                
              </Box>            
            </Box>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
          >
            <a className={style.socialUrl} href={tokenData.website}>
              <WebSite/>
            </a>            
            <a className={style.socialUrl} href={tokenData.facebook}>
              <FaceBook className={style.socialUrl}/>
            </a>
            <a className={style.socialUrl} href={tokenData.twitter}>
              <Twitter className={style.socialUrl}/>
            </a>
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
            <p className={style.tokenTotalSupply} style={{color:textColor}}>{tokenData.totalSupply != null ? 
              numberWithCommasTwoDecimals(tokenData.totalSupply) :
              0}</p>
          </Box>
        </Box>
      </Box>
      <nav>
        <hr aria-orientation='horizontal'></hr>
      </nav>
      <Box className={style.tokenMarktetInfo} alignItems={"center"}>
        <Box display={"flex"} flexDirection={"row"} width={"83%"} height={"100%"} alignItems={"center"}>
          <Box display={"flex"} flexDirection={"column"} width={"28%"} paddingLeft={"4rem"}>
            <p className={style.marketCap} style={{color:textColor}} >Market Cap</p>
            <p className={style.tokenMarketCap} style={{color:"#00B112"}}>{convertBalanceCurrency(parseFloat(tokenData.marketCap))}</p>
          </Box>
          <div className={style.border} style={{borderColor:infoborderColorMode}}/>
          <Box display={"flex"} flexDirection={"row"} width={"28%"} paddingLeft={"0.2rem"} paddingRight={"0.5rem"} justifyContent={"space-between"} alignItems={"center"}>
            <Box display={"flex"} flexDirection={"column"} >
              <p className={style.marketCap} style={{color:textColor}}>UNI / BNB (LP)</p>
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
                <p className={style.tokenMarketCap} style={{marginRight:"1rem"}}  color={whiteBlackMode}>{numberWithCommasTwoDecimals(parseFloat(tokenData.marketCap))}</p>
                <p className={style.tokenMarketCap} style={{color:"#00B112"}}>({convertBalanceCurrency(tokenData.balance! * tokenData.price)})</p>
              </Box>
            </Box>
            <Box cursor={"pointer"}>
              
            </Box>
          </Box>
          <div className={style.border} style={{borderColor:infoborderColorMode}}/>
          <Box display={"flex"} flexDirection={"column"} width={"39%"}>
              <p className={style.marketCap} style={{color:textColor}}>Balance</p>
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
                <p className={style.tokenMarketCap} style={{marginRight:"1rem"}} color={whiteBlackMode}>{numberWithCommasTwoDecimals(tokenData.balance)}</p>
                <p className={style.tokenMarketCap} style={{color:"#00B112"}}>({convertBalanceCurrency(tokenData.balance! * tokenData.price)})</p>
              </Box>
          </Box>          
        </Box>
        <div className={style.border} style={{borderColor:infoborderColorMode}}/>
        <Box display={"flex"} flexDirection={"row"} width={"25%"} alignItems={"center"}>
          <Box display={"flex"} flexDirection={"row"} width={"100%"} paddingLeft={"0.1rem"}>
            <Box display={"flex"} flexDirection={"column"} width={"50%"}>
              <p className={style.holder} style={{color:textColor}}>Holders</p>
              <p className={style.itemvalue} color={whiteBlackMode}>{holdersCount}</p>
            </Box>
            <Box>
              <p className={style.holder} style={{color:textColor}}>Transactions</p>
              <p className={style.itemvalue} color={whiteBlackMode}>{transactionCount}</p>
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
        padding={"0.5rem 0rem 0.5rem 1.5rem"}
        width={"100%"}
        height={"2.4rem"}
      >
        <Box
          display={"flex"}
          width={"83%"}
          alignItems={"center"}
          paddingLeft={"4rem"}
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
            <p style={{marginRight:"0.5rem", color:textColor}}>Buy</p>
            <p color={whiteBlackMode}> 5%</p>
          </Box>
          <Box className={style.itemvalue} width={"50%"}>
            <p style={{marginRight:"0.5rem", color:textColor}}>Sell</p>
            <p color={whiteBlackMode}> 5%</p>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}