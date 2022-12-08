import React, { useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { Box, Input, Button, useColorModeValue, useColorMode } from "@chakra-ui/react"
import {
  useAddress,
  useNetwork,
} from '@thirdweb-dev/react'
import {
  getTokenInfoFromWalletAddress,
  getContractInfoFromWalletAddress,
  getTokenInfoFromTokenName,
  getTokenNameWithAddress,
  wrappedCurrency,
  getTokenLogoURL
} from '../../api'
import {
  useTokenInfo,
  useDebounce
} from '../../hooks'
import {ERC20Token} from '../../utils/type'
import { 
  BNBIcon, 
  ETHIcon,
  PinIcon,
  UnPinIcon,
  PinLightIcon,
  UnPinLightIcon
} from '../../assests/icon'
import {
  setCookie,
  getCookie,
  deleteCookie
} from '../../utils'
import * as constant from '../../utils/constant'
import TokenListItem from './TokenListItem'
import style from './TokenList.module.css'
import { BigNumber } from 'ethers'

export default function TokenList() {
  const colorMode = useColorMode();
  const listClass = useColorModeValue(
    style.tokenList + " " + style.tokenListLight,
    style.tokenList + " " + style.tokenListDark
  );
  const whiteColor = useColorModeValue("#000000","#FFFFFF");
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const searchClass = useColorModeValue(
    style.tokenSearchLight,
    style.tokenSearchDark,
  );
  const walletAddress = useAddress();
  const {setTokenData} = useTokenInfo();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 200);
  const [selectUSDT, setSelectUSDT] = useState<Boolean>(true);
  const [selectUSDC, setSelectUSDC] = useState<Boolean>(false);
  const [selectWBTC, setSelectWBTC] = useState<Boolean>(false);
  const [selectUNI, setSelectUNI] = useState<Boolean>(false);
  const [selectFoundToken, setSelectFoundToken] = useState<Boolean>(false);
  const network = useNetwork();

  const [showPinedToken, setShowPinedToken] = useState<Boolean>();
  const [activeToken, setActiveToken] = useState<ERC20Token>();
  const [foundToken, setFoundToken] = useState<ERC20Token>();
  const [pinedTokens, setPinedTokens] = useState<ERC20Token[]>([]);
 
  const searchToken = async() => {
    if (debouncedQuery[0] == "0" && debouncedQuery[1] == "x") {
      const res_eth = await getTokenNameWithAddress(debouncedQuery, constant.ETHEREUM_NETWORK);
      const res_bsc = await getTokenNameWithAddress(debouncedQuery, constant.BINANCE_NETOWRK);
      let token;
      if (res_eth != constant.NOT_FOUND_TOKEN) {
        const logo = await getTokenLogoURL(debouncedQuery, constant.ETHEREUM_NETWORK);
        token = {
          name: res_eth[0],
          contractAddress: debouncedQuery,
          price: 0,
          marketCap: "",
          totalSupply: "0",
          holdersCount: 0,
          balance: 0,
          symbol: res_eth[1],
          image: logo,
          network: constant.ETHEREUM_NETWORK
        } as ERC20Token;
        setFoundToken(token);
      } else if (res_bsc != constant.NOT_FOUND_TOKEN) {
        const logo = await getTokenLogoURL(debouncedQuery, constant.BINANCE_NETOWRK);
        token = {
          name: res_bsc[0],
          contractAddress: debouncedQuery,
          price: 0,
          marketCap: "",
          totalSupply: "0",
          holdersCount: 0,
          symbol: res_bsc[1],
          balance: 0,
          image: logo,
          network: constant.BINANCE_NETOWRK
        } as ERC20Token;
        setFoundToken(token);        
      }
      else {
        setFoundToken(undefined);
      }
    } else {
      setFoundToken(undefined);
    }
  }

  const handleSearchChange = async (e: { target: { value: string; }; }) => {
    const findString = e.target.value.toLowerCase();
    setSearchQuery(findString);
  };
  
  const handleEnter = useCallback(
    async (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        searchToken();
      }
  }, [debouncedQuery])

  useEffect(() => {
    searchToken();
    setShowPinedToken(debouncedQuery.length == 0);
  }, [debouncedQuery]);

  const setFunc1 = async () => {
    const address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const res = await getTokenInfoFromWalletAddress(address);
    let balance = 0;
    let decimal = 0;
    if (walletAddress != null){
      const res1 = await getContractInfoFromWalletAddress(walletAddress!);
      const tokenCnt = Object.keys(res1["tokens"]).length;
      if (tokenCnt != 0) {
        res1.tokens.forEach((value: any) => {
          if (value.tokenInfo.address == address.toLowerCase()) {
            balance = value.balance;
            decimal = parseInt(value.tokenInfo.decimals);
          }
        });
      }
    }
    let token:ERC20Token;
    token={
      name: res.name,
      symbol: res.symbol,
      contractAddress: res.address,
      price: res.price.rate,
      marketCap: res.price.marketCapUsd,
      totalSupply: res.totalSupply,
      holdersCount: res.holdersCount,
      balance: balance,
      decimals: decimal,
      image:"https://s2.coinmarketcap.com/static/img/coins/64x64/825.png"
    } as ERC20Token;
    setTokenData(token);
    setSelectUSDT(true);
    setSelectUNI(false);
    setSelectUSDC(false);
    setSelectWBTC(false);
    setSelectFoundToken(false);
  }

  const setFunc2 = async () => {
    const address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const res = await getTokenInfoFromWalletAddress(address);
    let balance = 0;
    let decimal = 0;
    if (walletAddress != null){
      const res1 = await getContractInfoFromWalletAddress(walletAddress!);
      const tokenCnt = Object.keys(res1["tokens"]).length;
      if (tokenCnt != 0) {
        res1.tokens.forEach((value: any) => {
          if (value.tokenInfo.address == address.toLowerCase()) {
            balance = value.balance;
            decimal = parseInt(value.tokenInfo.decimals);
          }
        });
      }
    }
    let token:ERC20Token;
    token={
      name: res.name,
      symbol: res.symbol,
      contractAddress: res.address,
      price: res.price.rate,
      marketCap: res.price.marketCapUsd,
      totalSupply: res.totalSupply,
      holdersCount: res.holdersCount,
      balance: balance,
      decimals: decimal,
      image:"https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png"
    } as ERC20Token;
    setTokenData(token);
    setSelectUSDT(false);
    setSelectUNI(false);
    setSelectUSDC(true);
    setSelectWBTC(false);
    setSelectFoundToken(false);
  }

  const setFunc3 = async () => {
    const address = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
    const res = await getTokenInfoFromWalletAddress(address);
    let balance = 0;
    let decimal = 0;
    if (walletAddress != null){
      const res1 = await getContractInfoFromWalletAddress(walletAddress!);
      const tokenCnt = Object.keys(res1["tokens"]).length;
      if (tokenCnt != 0) {
        res1.tokens.forEach((value: any) => {
          if (value.tokenInfo.address == address.toLowerCase()) {
            balance = value.balance;
            decimal = parseInt(value.tokenInfo.decimals);
          }
        });
      }
    }
    let token:ERC20Token;
    token={
      name: res.name,
      symbol: res.symbol,
      contractAddress: res.address,
      price: res.price.rate,
      marketCap: res.price.marketCapUsd,
      totalSupply: res.totalSupply,
      holdersCount: res.holdersCount,
      balance: balance,
      decimals: decimal,
      image:"https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png"
    } as ERC20Token;
    setTokenData(token);
    setSelectUSDT(false);
    setSelectUNI(false);
    setSelectUSDC(false);
    setSelectWBTC(true);
    setSelectFoundToken(false);
  }

  const setFunc4 = async () => {
    const address = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
    const res = await getTokenInfoFromWalletAddress(address);
    let balance = 0;
    let decimal = 0;
    if (walletAddress != null){
      const res1 = await getContractInfoFromWalletAddress(walletAddress!);
      const tokenCnt = Object.keys(res1["tokens"]).length;
      if (tokenCnt != 0) {
        res1.tokens.forEach((value: any) => {
          if (value.tokenInfo.address == address.toLowerCase()) {
            balance = value.balance;
            decimal = parseInt(value.tokenInfo.decimals);
          }
        });
      }
    }
    let token:ERC20Token;
    token={
      name: res.name,
      symbol: res.symbol,
      contractAddress: res.address,
      price: res.price.rate,
      marketCap: res.price.marketCapUsd,
      totalSupply: res.totalSupply,
      holdersCount: res.holdersCount,
      balance: balance,
      decimals: decimal,
      image:"https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png"
    } as ERC20Token;
    setTokenData(token);
    setSelectUSDT(false);
    setSelectUNI(true);
    setSelectUSDC(false);
    setSelectWBTC(false);
    setSelectFoundToken(false);
  }

  useEffect(() => {
    const cookieString = getCookie("PinedToken");
    const tokenString = cookieString?.split("&");
    let cookieToken:ERC20Token[] = [];
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
        totalSupply:obj["totalSupply"]
      } as ERC20Token;
      cookieToken.push(token);
    });
    setPinedTokens(cookieToken); 
  }, []);

  const addPinTokenHandler = (token:ERC20Token) => {
    setPinedTokens(pinedTokens.filter(item => item != token)); 
    setPinedTokens(tokens => [...tokens, token]);
    const obj = JSON.stringify(token);
    const savedCookieString = getCookie("PinedToken");
    let cookieString:string;
    if (savedCookieString != undefined){
      cookieString = savedCookieString + obj+ "&";
    } else {
      cookieString = obj+ "&";
    }

    setCookie("PinedToken", cookieString);
  }

  const removePinTokenHandler = (token:ERC20Token) => {
    const filterTokens = pinedTokens.filter(item => item !== token);
    setPinedTokens(filterTokens);
    let newCookieString = "";
    filterTokens.forEach((token) => {
      const obj = JSON.stringify(token);
      newCookieString += obj;
      newCookieString += "&";
    });
    setCookie("PinedToken", newCookieString);
  }


  const setFuncFoundToken = (token:ERC20Token) => {
    setTokenData(token);
  }  

  const setFuncPinnedToken = () => {
    
  }  

  const setActiveTokenHandler = (token:ERC20Token) => {
    setActiveToken(token);
    setTokenData(token)
  }

  return (
    <Box className={listClass}>
      <Box className = {style.tokenSearch}>
        <Input 
          placeholder='Search'
          onChange={handleSearchChange} 
          onKeyDown={handleEnter}
          fontSize='0.8rem'
          borderRadius={'2rem'}
          height='2.5rem'
          className={searchClass}
        />
      </Box>
      <Box style={{display:"flex", flexDirection:"column", width:"100%"}}>
        {/* <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor, color:"#FFFFFF"}}
          onClick={setFunc1}
          backgroundColor={selectUSDT ? hoverColor:"#transparent"}
          color={selectUSDT?"#FFFFFF":whiteColor}
        >
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} width={"90%"} justifyContent={"space-between"}>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
              <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" width={"50rem"} />
              <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
                <p className={style.tokenName}>USDT</p>
                <p className={style.tokenAddress}>0xdAC17F9......7C13D831ec7</p>
              </Box>
            </Box>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
              <BNBIcon/>
              {
                colorMode.colorMode == "light" ? <PinLightIcon/> : <PinIcon/>
              }            
            </Box>
          </Box>
        </Box>
        <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor, color:"#FFFFFF"}}
          onClick={setFunc2}
          backgroundColor={selectUSDC ? hoverColor:"#transparent"}
          color={selectUSDC?"#FFFFFF":whiteColor}
        >
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} width={"90%"} justifyContent={"space-between"}>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
              <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png" width={"50rem"}/>
              <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
                <p className={style.tokenName} >USDC</p>
                <p className={style.tokenAddress}>0xdAC17F9......7C13D831ec7</p>
              </Box>
            </Box>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
              <ETHIcon/>
              {
                colorMode.colorMode == "light" ? <PinLightIcon/> : <PinIcon/>
              }     
            </Box>
          </Box>          
        </Box> 
        <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor, color:"#FFFFFF"}}
          onClick={setFunc3}
          backgroundColor={selectWBTC ? hoverColor:"#transparent"}
          color={selectWBTC?"#FFFFFF":whiteColor}
        >
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} width={"90%"} justifyContent={"space-between"}>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
              <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png" width={"50rem"}/>
              <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
                <p className={style.tokenName} >WBTC</p>
                <p className={style.tokenAddress}>0xdAC17F9......7C13D831ec7</p>
              </Box>
            </Box>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
              <ETHIcon/>
              {
                colorMode.colorMode == "light" ? <PinLightIcon/> : <PinIcon/>
              }     
            </Box>
          </Box>          
        </Box> 
        <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor, color:"#FFFFFF"}}
          onClick={setFunc4}
          backgroundColor={selectUNI ? hoverColor:"#transparent"}
          color={selectUNI?"#FFFFFF":whiteColor}
        >
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} width={"90%"} justifyContent={"space-between"}>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
              <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png" width={"50rem"}/>
              <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
                <p className={style.tokenName} >UNI</p>
                <p className={style.tokenAddress}>0xdAC17F9......7C13D831ec7</p>
              </Box>
            </Box>
            <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
              <ETHIcon/>
              {
                colorMode.colorMode == "light" ? <PinLightIcon/> : <PinIcon/>
              }     
            </Box>
          </Box>          
        </Box>  */}
          {
            foundToken != undefined && 
            <TokenListItem
              tokenData = {foundToken}
              isPined = {false}
              activeToken = {activeToken!}
              activeTokenHandler = {setActiveTokenHandler}
              pinTokenHandler = {addPinTokenHandler}
              unPinTokenHandler = {removePinTokenHandler}
            /> 
          }
          {
            showPinedToken &&
            pinedTokens.map((token) => {
              if (token == foundToken)
                return;
              return (
              <TokenListItem
                key={token.name+token.network}
                tokenData = {token}
                isPined = {true}
                activeToken = {activeToken!}
                activeTokenHandler = {setActiveTokenHandler}
                pinTokenHandler = {addPinTokenHandler}
                unPinTokenHandler = {removePinTokenHandler}
              />);      
            })
          }
        </Box>
    </Box>
  );
}