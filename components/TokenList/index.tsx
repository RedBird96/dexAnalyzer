import React, { useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { Box, Input, Button, useColorModeValue, useColorMode } from "@chakra-ui/react"
import {
  useAddress,
  useNetwork,
} from '@thirdweb-dev/react'
import {
  getTokenLogoURL,
  getTokenSymbol
} from '../../api'
import {
  useTokenInfo,
  useDebounce
} from '../../hooks'
import {ERC20Token, SearchStatus} from '../../utils/type'
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
  const searchClass = useColorModeValue(
    style.tokenSearchLight,
    style.tokenSearchDark,
  );
  const walletAddress = useAddress();
  const {setTokenData} = useTokenInfo();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery.replace(/\s/g, ''), 200);
  const network = useNetwork();

  const [showListToken, setShowListToken] = useState<Boolean>();
  const [activeToken, setActiveToken] = useState<ERC20Token>();
  const [foundToken, setFoundToken] = useState<ERC20Token>();
  const [listTokens, setListTokens] = useState<ERC20Token[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(SearchStatus.notsearch);
 
  const searchToken = async() => {
    if (debouncedQuery[0] == "0" && debouncedQuery[1] == "x") {
      let existToken = undefined;
      const found = listTokens.find((element) => {
        existToken = element;
        return (element.contractAddress) === (debouncedQuery);
      });
      if (found && existToken != undefined){
        setFoundToken(existToken);
        setSearchStatus(SearchStatus.founddata);     
        return;
      }
      setSearchStatus(SearchStatus.searching);
      const res_eth = await getTokenSymbol(debouncedQuery, constant.ETHEREUM_NETWORK);
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
          network: constant.ETHEREUM_NETWORK,
          pinSetting: false,
        } as ERC20Token;
        setFoundToken(token);
        setSearchStatus(SearchStatus.founddata);    
      } else {
        const res_bsc = await getTokenSymbol(debouncedQuery, constant.BINANCE_NETOWRK);
        if (res_bsc != constant.NOT_FOUND_TOKEN) {
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
            network: constant.BINANCE_NETOWRK,
            pinSetting: false,
          } as ERC20Token;
          setFoundToken(token);   
          setSearchStatus(SearchStatus.founddata);     
        } else {
          setFoundToken(undefined);
          setSearchStatus(SearchStatus.notsearch);
        }
      }
    } else {
      setFoundToken(undefined);
      setSearchStatus(SearchStatus.notsearch);
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
    setShowListToken(debouncedQuery.length == 0);
  }, [debouncedQuery]);

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
        totalSupply:obj["totalSupply"],
        pinSetting:obj["pinSetting"]
      } as ERC20Token;
      if (token.pinSetting == false)
        return;
      cookieToken.push(token);
    });
    setListTokens(cookieToken); 
  }, []);

  const addPinTokenHandler = (token:ERC20Token) => {
    const filterTokens = listTokens.filter(item => item.contractAddress !== token.contractAddress);
    if (token.pinSetting) {
      filterTokens.push(token);
      setListTokens(filterTokens); 
    } else {
      setListTokens(filterTokens);
    }
    let newCookieString = "";
    filterTokens.forEach((token) => {
      const obj = JSON.stringify(token);
      newCookieString += obj;
      newCookieString += "&";
    });
    setCookie("PinedToken", newCookieString);
  }

  const setActiveTokenHandler = (token:ERC20Token) => {
    setActiveToken(token);
    setTokenData(token);
    if (
      foundToken != undefined && 
      token.contractAddress == foundToken.contractAddress) {
      setSearchQuery("");
      setListTokens(
        listTokens.filter(item => item.contractAddress != token.contractAddress && 
        item.pinSetting == true)); 
      setListTokens(tokens => [...tokens, token]);
    } else if (token.pinSetting == true && listTokens.length >= 2){
      const last = listTokens.at(-1);
      if (last?.pinSetting == false)
        setListTokens(listTokens.filter(item => item.contractAddress != last!.contractAddress));
    }
  }

  return (
    <Box className={listClass}>
      <Box className = {style.tokenSearch}>
        <Input 
          id='SearchId'
          placeholder='Search'
          onChange={handleSearchChange} 
          onKeyDown={handleEnter}
          fontSize='0.8rem'
          borderRadius={'2rem'}
          height='2.5rem'
          className={searchClass}
          value={searchQuery}
        />
      </Box>
      <Box style={{display:"flex", flexDirection:"column", width:"100%"}}>
          {
            searchStatus == SearchStatus.searching &&
            <Box width = "100%" style={{display:"flex", justifyContent:"center"}}>
              Searching...
            </Box>
          }
          {
            foundToken != undefined && searchStatus == SearchStatus.founddata ? (
            <Box 
              width = "100%" 
              style={{
                display:"flex", 
                justifyContent:"center", 
                flexDirection:"column"
              }}>
              <p style={{display:"flex", justifyContent:"center", width:"90%"}}> Search Result </p>
              <TokenListItem
                tokenData = {foundToken}
                activeToken = {activeToken!}
                activeTokenHandler = {setActiveTokenHandler}
                pinTokenHandler = {addPinTokenHandler}
              />
            </Box>
            ):(
              debouncedQuery.length > 0 && searchStatus == SearchStatus.notsearch &&
              <Box 
                width = "100%" 
                style={{
                  display:"flex", 
                  justifyContent:"center", 
                  flexDirection:"column", 
                alignItems:"center"
              }}>
                <p style={{display:"flex", justifyContent:"center", width:"90%"}}>Search Result</p>
                <Box style={{
                  display:"flex", 
                  justifyContent:"center", 
                  alignItems:"center"
                  }}
                  width="90%" 
                  height="4.8rem"
                >
                  <p>No Data Found</p>
                </Box>
              </Box>
            )
          }
          {
            showListToken &&
            listTokens.map((token) => {
              if (token == foundToken)
                return;
              return (
              <TokenListItem
                key={token.name+token.network}
                tokenData = {token}
                activeToken = {activeToken!}
                activeTokenHandler = {setActiveTokenHandler}
                pinTokenHandler = {addPinTokenHandler}
              />);      
            })
          }
        </Box>
    </Box>
  );
}