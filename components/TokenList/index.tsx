import React, { useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { Box, Input, useColorModeValue, useColorMode, InputGroup, InputLeftAddon, InputLeftElement, InputRightElement } from "@chakra-ui/react"
import {
  useAddress,
  useNetwork,
} from '@thirdweb-dev/react'
import {
  getTokenLogoURL,
  getTokenSymbol,
  getTokenSocialInfofromCoingeckoAPI
} from '../../api'
import {
  useTokenInfo,
  useDebounce
} from '../../hooks'
import {ERC20Token, SearchStatus} from '../../utils/type'
import * as constant from '../../utils/constant'
import TokenListItem from './TokenListItem'
import style from './TokenList.module.css'
import { SearchCross, SearchIcon } from '../../assests/icon'

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
  const debouncedActiveToken = useDebounce<ERC20Token>(activeToken, 500);
  const [foundToken, setFoundToken] = useState<ERC20Token[]>([]);
  const [listTokens, setListTokens] = useState<ERC20Token[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(SearchStatus.notsearch);
 
  const searchToken = async() => {

    if (debouncedQuery[0] == "0" && debouncedQuery[1] == "x") {
      let foundFlag = false;
      let foundEthToken:ERC20Token={
        contractAddress: "0x00",
        name: '',
        symbol: '',
        network: 0,
        price: 0,
        usdBalance: 0,
        decimals: 0,
        holdersCount: 0,
        balance:0,
        image: '',
        owner: '',
        totalSupply: 0,
        marketCap: '',
        pinSetting: false
      };
      let foundBscToken:ERC20Token={
        contractAddress: "0x00",
        name: '',
        symbol: '',
        network: 0,
        price: 0,
        usdBalance: 0,
        decimals: 0,
        holdersCount: 0,
        balance:0,
        image: '',
        owner: '',
        totalSupply: 0,
        marketCap: '',
        pinSetting: false
      };
      listTokens.map((element) => {
        if (element.contractAddress.toLowerCase() == debouncedQuery.toLowerCase())
        {
          if (element.network == constant.ETHEREUM_NETWORK){
            foundEthToken = element;
          } else if (element.network == constant.BINANCE_NETOWRK) {
            foundBscToken = element;
          }
          foundFlag = true;
        }
      });
      setSearchStatus(SearchStatus.searching);
      if (foundEthToken.contractAddress == "0x00") {
        const res_eth = await getTokenSymbol(debouncedQuery, constant.ETHEREUM_NETWORK);
        if (res_eth != constant.NOT_FOUND_TOKEN) {
          foundFlag = true;
          const ETHLINK = "  https://etherscan.io/";
          const logo = await getTokenLogoURL(debouncedQuery, constant.ETHEREUM_NETWORK, res_eth[1]);
          const social = await getTokenSocialInfofromCoingeckoAPI(debouncedQuery, constant.ETHEREUM_NETWORK);
          const token = {
            name: res_eth[0],
            contractAddress: debouncedQuery.toLowerCase(),
            price: 0,
            marketCap: "",
            totalSupply: res_eth[3],
            holdersCount: 0,
            balance: 0,
            decimals: res_eth[2],
            symbol: res_eth[1],
            image: logo,
            network: constant.ETHEREUM_NETWORK,
            pinSetting: false,
            website: social![0],
            twitter: social![1],
            facebook: social![2],
            contractCodeURL: ETHLINK + "address/" + debouncedQuery +"#code",
            contractBalanceWalletURL: ETHLINK + "token/" + debouncedQuery + "?a=",
            contractBalanceURL: ETHLINK + "token/" + debouncedQuery + "#balances",
            contractPage:ETHLINK + "token/" + debouncedQuery
          } as ERC20Token;
          foundEthToken = token;
        }
      }
      if (foundBscToken.contractAddress == "0x00") {
        const BSCLINK = " https://bscscan.com/";
          const res_bsc = await getTokenSymbol(debouncedQuery, constant.BINANCE_NETOWRK);
          if (res_bsc != constant.NOT_FOUND_TOKEN) {
            foundFlag = true;
            const logo = await getTokenLogoURL(debouncedQuery, constant.BINANCE_NETOWRK, res_bsc[1]);
            const social = await getTokenSocialInfofromCoingeckoAPI(debouncedQuery, constant.BINANCE_NETOWRK);
            const token = {
              name: res_bsc[0],
              contractAddress: debouncedQuery.toLowerCase(),
              price: 0,
              marketCap: "",
              totalSupply: res_bsc[3],
              holdersCount: 0,
              symbol: res_bsc[1],
              balance: 0,
              decimals: res_bsc[2],
              image: logo,
              network: constant.BINANCE_NETOWRK,
              pinSetting: false,
              website: social![0],
              twitter: social![1],
              facebook: social![2],
              contractCodeURL: BSCLINK + "address/" + debouncedQuery +"#code",
              contractBalanceWalletURL: BSCLINK + "token/" + debouncedQuery + "?a=",
              contractBalanceURL: BSCLINK + "token/" + debouncedQuery + "#balances",
              contractPage:BSCLINK + "token/" + debouncedQuery
            } as ERC20Token;
            foundBscToken = token;
          } 
      }
      if(foundFlag == true){
        setFoundToken(foundToken.filter(
          item => (item.contractAddress != debouncedQuery.toLowerCase())
        ));     
        if (foundEthToken.contractAddress != "0x00"){
          setFoundToken(tokens=>[...tokens, foundEthToken]);     
        }   
        if (foundBscToken.contractAddress != "0x00") {
          setFoundToken(tokens=>[...tokens, foundBscToken]);  
        }
        setSearchStatus(SearchStatus.founddata);     
      } else {
        setFoundToken([]);
        setSearchStatus(SearchStatus.notsearch);
      }
    } else {
      setFoundToken([]);
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
    setTokenData(debouncedActiveToken);
  }, [debouncedActiveToken])

  useEffect(() => {
    // const cookieString = getCookie("PinnedToken");
    const cookieString = localStorage.getItem("PinnedToken");
    console.log('newCookieString', cookieString)
    const tokenString = cookieString?.split(";");
    let cookieToken:ERC20Token[] = [];
    tokenString?.forEach((jsonToken, index)=>{
      if (jsonToken.length < 2)
        return;
      try{
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
          website:obj["website"],
          twitter:obj["twitter"],
          facebook:obj["facebook"],
          contractCodeURL:obj["contractCodeURL"],
          contractBalanceWalletURL:obj["contractBalanceWalletURL"],
          contractBalanceURL:obj["contractBalanceURL"],
          contractPage:obj["contractPage"]
        } as ERC20Token;
        cookieToken.push(token);
      } catch(e){

      }
    });
    setListTokens(cookieToken); 
  }, []);

  const TokenActionHandler = (token:ERC20Token, add:boolean) => {
    console.log('select token', token);
    let filterTokens = listTokens;
    filterTokens = filterTokens.filter(item => (item.contractAddress + item.network) != (token.contractAddress + token.network));
    

    filterTokens = filterTokens.sort((value1, value2) => {
      if (value1.pinSetting && !value2.pinSetting)
        return -1;
      else if (!value1.pinSetting && value2.pinSetting)
        return 1;
      else {
        if (value1.name > value2.name)
          return -1;
        else if (value1.name < value2.name)
          return 1;
        return 0;
      }
    })
    
    if (add) {
      if (token.pinSetting)
        filterTokens.splice(0, 0, token);
      else
        filterTokens.push(token);
    }
    console.log('filterTokens', filterTokens);
    setListTokens(filterTokens);
    let newCookieString = "";
    filterTokens.forEach((token) => {
      const obj = JSON.stringify(token);
      if (obj.indexOf(";") == -1) {
        newCookieString += obj;
        newCookieString += ";";
      }
    });
    console.log('newCookieString', newCookieString)
    localStorage.setItem("PinnedToken", newCookieString);
    // setCookie("PinnedToken", newCookieString);
  }

  const setActiveTokenHandler = (token:ERC20Token) => {
    setActiveToken(token);
    // setTokenData(token);
    if (searchStatus == SearchStatus.founddata) {
      setSearchQuery("");
      let filterTokens = listTokens;
      filterTokens = filterTokens.filter(item => (item.contractAddress + item.network) != (token.contractAddress + token.network)); 
      const unPinIndex = filterTokens.findIndex((value:any) => value.pinSetting == false);

      if (unPinIndex != -1)
        filterTokens.splice(unPinIndex, 0, token);
      else
        filterTokens.push(token);

      setListTokens(filterTokens); 
    }
    //  else if (token.pinSetting == true && listTokens.length >= 2){
    //   const last = listTokens.at(-1);
    //   if (last?.pinSetting == false)
    //     setListTokens(listTokens.filter(
    //       item => (item.contractAddress+item.network) != 
    //       (last!.contractAddress + last!.network)
    //   ));
    // }
  }
  return (
    <Box className={listClass}>
      <Box className = {style.tokenSearch}>
        <InputGroup>
          <InputLeftElement
            paddingTop = '7px'
            paddingLeft= '5px'
            pointerEvents='none'
          >
            <SearchIcon/>
          </InputLeftElement>
          <Input 
            id='SearchId'
            placeholder='Search token address'
            _placeholder={{fontsize:'1rem', fontcolor:"#E34B62"}}
            onChange={handleSearchChange} 
            onKeyDown={handleEnter}
            borderRadius={'2rem'}
            height='2.5rem'
            className={searchClass}
            value={searchQuery}
          />
          {
            searchQuery.length > 0 && 
            <InputRightElement
              onClick={()=>{setSearchQuery("");}}
              cursor='pointer'
              paddingTop = '7px'
              paddingRight= '5px'
            >
              <SearchCross/>
            </InputRightElement>
          }
        </InputGroup>
      </Box>
      <Box 
        style={{
          display:"flex", 
          flexDirection:"column", 
          width:"100%", 
          overflow:"auto", 
          maxHeight:"71.9rem"
          }}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
              height: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '4px',
              height: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: "#3D3D3D",
              borderRadius: '24px',
            },
          }}

        >
          {
            searchStatus == SearchStatus.searching &&
            <Box width = "100%" style={{display:"flex", justifyContent:"center"}}>
              Searching...
            </Box>
          }
          {
            foundToken.length != 0 && searchStatus == SearchStatus.founddata ? (
            <Box 
              width = "100%" 
              style={{
                display:"flex", 
                justifyContent:"center", 
                flexDirection:"column"
              }}>
                <p style={{display:"flex", justifyContent:"center", width:"90%"}}> Search Result </p>
                {
                  foundToken.map((token) => {
                    return(
                      <TokenListItem
                        key={token.contractAddress + token.network}
                        tokenData = {token}
                        activeToken = {debouncedActiveToken!}
                        activeTokenHandler = {setActiveTokenHandler}
                        pinTokenHandler = {TokenActionHandler}
                      />
                    );
                  })
                }
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
              const alreadyListed = foundToken.find(element => (element.contractAddress + element.network) == (token.contractAddress + token.network));
              if (alreadyListed != undefined)
                return;
              return (
              <TokenListItem
                key={token.name+token.network}
                tokenData = {token}
                activeToken = {debouncedActiveToken!}
                activeTokenHandler = {setActiveTokenHandler}
                pinTokenHandler = {TokenActionHandler}
              />);      
            })
          }
        </Box>
    </Box>
  );
}