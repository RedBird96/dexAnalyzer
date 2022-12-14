import React, {useState, useEffect} from 'react'
import { Box, color, Switch, useColorMode, useColorModeValue  } from "@chakra-ui/react"
import {
  WebSite,
  FaceBook,
  Twitter,
  CopyAddressIconDark,
  CopyAddressIconLight,
  CoyAddressComfirm
} from "../../assests/icon"
import {
  useTokenInfo,
  useLPTokenPrice,
  useWalletTokenBalance
} from '../../hooks'
import { 
  convertBalanceCurrency,
  numberWithCommasTwoDecimals,
  numberWithCommasNoDecimals
} from '../../utils'
import {
  getLPTokenReserve,
  getTokenInfoFromWalletAddress,
  getLPTokenList,
  getTokenPricefromllama
} from '../../api'
import {
  setCookie,
  getCookie,
  deleteCookie
} from '../../utils'
import style from './TokenInfo.module.css'
import * as constant from '../../utils/constant'
import LpTokenInfo from './LpTokenInfo'
import { LPTokenPair, TokenSide } from '../../utils/type'


export default function TokenInfo() {

  const colorMode = useColorMode();
  const {tokenData, setTokenData} = useTokenInfo();
  const {walletTokens} = useWalletTokenBalance();
  const {lpTokenPrice, lpTokenAddress ,setLPTokenAddress} = useLPTokenPrice();
  
  const [lpTokenList, setLPTokenList] = useState<LPTokenPair[]>([]);
  const [lpTokenPinList, setLPTokenPinList] = useState<LPTokenPair[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);

  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [holdersCount, setHoldersCount] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const infoClass = useColorModeValue(
    style.tokenInfo + " " + style.tokenInfoLight,
    style.tokenInfo + " " + style.tokenInfoDark
  );

  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const infoborderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');

  const setLPTokenListInfo = async() => {
    const findInd = lpTokenPinList.findIndex((value) => value.ownerToken?.toLowerCase() == tokenData.contractAddress.toLowerCase());
    if (findInd != -1) {
      setLPTokenAddress(lpTokenPinList[findInd]);
    }
    const token0_Res = await getLPTokenList(tokenData.contractAddress, tokenData.network, TokenSide.token0);
    const token1_Res = await getLPTokenList(tokenData.contractAddress, tokenData.network, TokenSide.token1);

    setLPTokenList([]);
    const lptoken_Res = token0_Res.concat(token1_Res);
    let index = 0;
    if (lptoken_Res.length == 0) {
      setLPTokenAddress({
        name:"/",
        symbol:"/",
        contractAddress:"",
        price: 0,
        marketCap: "",
        totalSupply: 0,
        holdersCount: 0,
        balance: 0,
        decimals: 18,
        image: "",
        network: constant.BINANCE_NETOWRK,
        token0_name: "0",
        token1_name: "0",
        token0_reserve: 0,
        token1_reserve: 0,
        token0_contractAddress: "",
        token1_contractAddress: "",
        tokenside: TokenSide.token1
      } as LPTokenPair);       
      return;
    }
    let lpToken_temp: LPTokenPair[] = [];
    for await (const value of lptoken_Res) {
     
      const res = await getLPTokenReserve(value.contractAddress, value.network);
      value.token0_reserve = res[0] / Math.pow(10, value.token0_decimal!);
      value.token1_reserve = res[1] / Math.pow(10, value.token1_decimal!);
      if (value.tokenside == TokenSide.token0){
        value.price = value.token1_reserve / value.token0_reserve;  
      } else {
        value.price = value.token0_reserve / value.token1_reserve;  
      }
      console.log('value', value);

      if (index == 0) {
        setLPTokenAddress(value);
      }
      else{
        lpToken_temp.push(value);
      }
      index ++;

    }
    setLPTokenList(lpToken_temp);    
  }
  const setTokenInfo = async() => {
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
  }

  const setLpTokenItem = (clickLp: LPTokenPair) => {
    
    const filterTokens = lpTokenList.filter(
      item => (item.contractAddress.toLowerCase() != clickLp.contractAddress.toLowerCase())
    );
    setLPTokenList([]);
    filterTokens.push(lpTokenAddress);
    setLPTokenList(filterTokens);
    setLPTokenAddress(clickLp);
    setDexDropShow(0);
  }

  const setDexDropShow = (clickDexCount: number) => {

    const obj = document.getElementById("dexlist");
    if (obj == null)
      return;    

    if (clickDexCount % 2 == 0)
      obj.style.display = "none";
    else 
      obj.style.display = "flex";
  }

  const addPinLPToken = () => {
    const filterTokens = lpTokenPinList.filter(
      item => (item.ownerToken?.toLowerCase() !== 
      lpTokenAddress.ownerToken?.toLowerCase())
    );    
    filterTokens.push(lpTokenAddress);
    setLPTokenPinList(filterTokens);
    let newCookieString = "";
    filterTokens.forEach((token) => {
      const obj = JSON.stringify(token);
      newCookieString += obj;
      newCookieString += "&";
    });
    setCookie("PinedLPToken", newCookieString);
  }

  const getLastLpTokenList = () => {
    const cookieString = getCookie("PinedLPToken");
    const tokenString = cookieString?.split("&");
    let cookieLPToken:LPTokenPair[] = [];
    tokenString?.forEach((jsonToken)=>{
      if (jsonToken.length < 2)
        return;
      const obj = JSON.parse(jsonToken);
      const token = {
        name:obj["name"],
        symbol:obj["symbol"],
        balance:obj["balance"],
        contractAddress:obj["contractAddress"],
        holdersCount:obj["holdersCount"],
        image:obj["image"],
        marketCap:obj["marketCap"],
        network:obj["network"],
        price:obj["price"],
        totalSupply:obj["totalSupply"],
        pinSetting:obj["pinSetting"],
        token0_contractAddress:obj["token0_contractAddress"],
        token0_name:obj["token0_name"],
        token0_reserve:obj["token0_reserve"],
        token1_contractAddress:obj["token1_contractAddress"],
        token1_name:obj["token1_name"],
        token1_reserve:obj["token1_reserve"],
        tokenside:obj["tokenside"],
        ownerToken:obj["ownerToken"]
      } as LPTokenPair;
      cookieLPToken.push(token);    
    });
    setLPTokenPinList(cookieLPToken); 
  }

  const copyBtnClick = () => {
    navigator.clipboard.writeText(tokenData.contractAddress)
    setCopyStatus(true);
    setTimeout(() => {
      setCopyStatus(false);
    }, 2000)
  }

  useEffect(() => {
    addPinLPToken();
    setLPTokenListInfo();
    setTokenInfo();
    setDexDropShow(0);
  }, [tokenData])

  useEffect(() => {
    getLastLpTokenList();
  }, [])
 
  useEffect(() => {
    const res = walletTokens.find((value) => value.contractAddress.toLowerCase() + value.network ==
                tokenData.contractAddress.toLowerCase() + tokenData.network);
    if (res != undefined) {
      setBalance(res.balance);
      setBalanceUSD(res.balance * lpTokenPrice);
    } else {
      setBalance(0);
      setBalanceUSD(0);
    }
  }, [walletTokens, tokenData, lpTokenPrice])
  return (
    <Box className={infoClass}>
      <Box className={style.tokenSocialInfo}>
        <Box display={"flex"} flexDirection={"row"} width={"83%"} alignItems={"center"}>
          <Box display={"flex"} flexDirection={"row"} width={"59%"} alignItems={"center"}>
            <img src={tokenData.image} width={"50rem"}/>
            <Box display={"flex"} flexDirection={"column"} paddingLeft={"1rem"} alignItems={"flex-start"}>
              <Box display={"flex"} flexDirection={"row"}>
                <p className={style.tokenName}>{tokenData.symbol}</p>
                <p className={style.tokenName} style={{color:"#767676"}}>&nbsp;({lpTokenAddress.symbol})</p>
                <p className={style.tokenPrice}>{convertBalanceCurrency( lpTokenPrice, 6)}</p>
              </Box>
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"} justifyContent={"center"}>
                <p className={style.tokenAddress} style={{color:textColor}}>{tokenData.contractAddress}</p>
                <Box onClick={copyBtnClick}>
                  
                  {copyStatus ? <CoyAddressComfirm/> :
                  colorMode.colorMode == "dark" ?
                  <CopyAddressIconDark cursor={"pointer"}/> :
                  <CopyAddressIconLight cursor={"pointer"}/> }
                </Box>
                
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
              numberWithCommasNoDecimals(tokenData.totalSupply) :
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
            <p className={style.tokenMarketCap} style={{color:"#00B112"}}>{convertBalanceCurrency(tokenData.totalSupply * lpTokenPrice, 0)}</p>
          </Box>
          <div style={{
            height:"90%",
            borderWidth:"1px",
            borderColor:infoborderColorMode,
          }}/>
          <Box 
            display={"flex"} 
            flexDirection={"column"} 
            width={"29%"} 
            position={"relative"} 
            height={"100%"}
            top={"0.4rem"}
          >
            <LpTokenInfo 
              lpToken={lpTokenAddress} 
              dropListHandler ={setDexDropShow}
              showArrow = {true}
              setLPTokenHandler = {setLpTokenItem}
              isLast = {false}
            />
            <Box 
              id="dexlist" 
              style={{
                maxHeight:"15rem", 
                display:"none", 
                position:"absolute", 
                top:"3.9rem", 
                width:"100%", 
                flexDirection:"column",
                overflowY:"auto",
                overflowX:"auto",
                borderWidth:"thin",
                zIndex:"99"
              }}>
              {
                lpTokenList.length >0 &&
                lpTokenList.map((value, index) => {
                  if (value.contractAddress == lpTokenAddress.contractAddress)
                    return;
                  return (
                    <LpTokenInfo
                      key = {value.contractAddress + value.symbol}
                      lpToken = {value}
                      dropListHandler ={setDexDropShow}
                      showArrow = {false}
                      setLPTokenHandler = {setLpTokenItem}
                      isLast = {index == lpTokenList.length - 1 ? true : false}
                    />
                  );
                })
              }
            </Box>
          </Box>          
          <div style={{
            marginRight:"1rem",
            height:"90%",
            borderWidth:"1px",
            borderColor:infoborderColorMode,
          }}/>
          <Box display={"flex"} flexDirection={"column"} width={"39%"}>
              <p className={style.marketCap} style={{color:textColor}}>Balance</p>
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
                <p className={style.tokenMarketCap} style={{marginRight:"1rem"}} color={whiteBlackMode}>{numberWithCommasTwoDecimals(balance)}</p>
                <p className={style.tokenMarketCap} style={{color:"#00B112"}}>({convertBalanceCurrency(balanceUSD)})</p>
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