import React, { useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { Box, Input, Button, useColorModeValue, useColorMode } from "@chakra-ui/react"
import {
  useAddress,
} from '@thirdweb-dev/react'
import {
  getTokenInfoFromWalletAddress,
  getContractInfoFromWalletAddress,
  getTokenInfoFromTokenName
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
} from '../../assests/icon';
import style from './TokenList.module.css'

export default function TokenList() {
  const colorMode = useColorMode();
  const listClass = useColorModeValue(
    style.tokenList + " " + style.tokenListLight,
    style.tokenList + " " + style.tokenListDark
  );
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const searchClass = useColorModeValue(
    style.tokenSearchLight,
    style.tokenSearchDark,
  );
  const bnbColor = "#EEB500";
  const ethColor = "#";
  const walletAddress = useAddress();
  const {setTokenData} = useTokenInfo();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 200);
  const [selectUSDT, setSelectUSDT] = useState<Boolean>(true);
  const [selectUSDC, setSelectUSDC] = useState<Boolean>(false);
  const [selectWBTC, setSelectWBTC] = useState<Boolean>(false);
  const [selectUNI, setSelectUNI] = useState<Boolean>(false);

  const handleSearchChange = async (e: { target: { value: string; }; }) => {
    const findString = e.target.value.toLowerCase();
    setSearchQuery(findString);
    if (findString[0] == "0" && findString[1] == "x" && findString.length >= 42) {
      const res1 = await getTokenInfoFromTokenName(findString);
      // const res = await getTokenInfoFromWalletAddress(findString!);
      // console.log('res', res);  
      // let token:ERC20Token;
      // token={
      //   name: res.symbol,
      //   contractAddress: res.address,
      //   price: res.price.rate,
      //   marketCap: res.price.marketCapUsd,
      //   totalSupply: res.totalSupply,
      //   holdersCount: res.holdersCount,
      //   balance: 0,
      //   decimals: 0,
      //   image:"https://s2.coinmarketcap.com/static/img/coins/64x64/825.png"
      // } as ERC20Token;    
    } else {

    }
  };
  
  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {

      }
  }, [debouncedQuery])

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
      name: res.symbol,
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
      name: res.symbol,
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
      name: res.symbol,
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
      name: res.symbol,
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
  }

  return (
    <Box className={listClass}>
      <Box className = {style.tokenSearch}>
        <Input 
          placeholder='Search'
          onChange={handleSearchChange} 
          fontSize='0.8rem'
          borderRadius={'2rem'}
          height='2rem'
          className={searchClass}
        />
      </Box>
      <Box style={{display:"flex", flexDirection:"column", width:"100%"}}>
        <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor}}
          onClick={setFunc1}
          backgroundColor={selectUSDT ? hoverColor:"#transparent"}
        >
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" width={"40rem"} />
            <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
              <p className={style.tokenName}>USDT</p>
              <p className={style.tokenAddress}>0xdAC17F958D2ee......97C13D831ec7</p>
            </Box>
          </Box>
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
            <BNBIcon/>
            {
              colorMode.colorMode == "light" ? <UnPinLightIcon/> : <UnPinIcon/>
            }            
          </Box>
        </Box>
        <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor}}
          onClick={setFunc2}
          backgroundColor={selectUSDC ? hoverColor:"#transparent"}
        >
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png" width={"40rem"}/>
            <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
              <p className={style.tokenName} >USDC</p>
              <p className={style.tokenAddress}>0xdAC17F958D2ee......97C13D831ec7</p>
            </Box>
          </Box>
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
            <ETHIcon/>
            {
              colorMode.colorMode == "light" ? <UnPinLightIcon/> : <UnPinIcon/>
            }     
          </Box>
        </Box> 
        <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor}}
          onClick={setFunc3}
          backgroundColor={selectWBTC ? hoverColor:"#transparent"}
        >
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png" width={"40rem"}/>
            <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
              <p className={style.tokenName} >WBTC</p>
              <p className={style.tokenAddress}>0xdAC17F958D2ee......97C13D831ec7</p>
            </Box>
          </Box>
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
            <ETHIcon/>
            {
              colorMode.colorMode == "light" ? <UnPinLightIcon/> : <UnPinIcon/>
            }     
          </Box>
        </Box> 
        <Box className= {style.tokenListInfo} 
          _hover={{bg:hoverColor}}
          onClick={setFunc4}
          backgroundColor={selectUNI ? hoverColor:"#transparent"}
        >
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png" width={"40rem"}/>
            <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
              <p className={style.tokenName} >UNI</p>
              <p className={style.tokenAddress}>0xdAC17F958D2ee......97C13D831ec7</p>
            </Box>
          </Box>
          <Box style={{display:"flex", flexDirection:"row", alignItems:"center", width:"3rem", justifyContent:"space-between"}}>
            <ETHIcon/>
            {
              colorMode.colorMode == "light" ? <UnPinLightIcon/> : <UnPinIcon/>
            }     
          </Box>
        </Box> 
      </Box>
    </Box>
  );
}