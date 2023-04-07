import React, { useEffect, useState, useCallback, KeyboardEvent, useMemo } from 'react'
import {
  Box, 
  Input, 
  useColorModeValue, 
  InputGroup, 
  InputLeftElement, 
  InputRightElement, 
  Button 
} from "@chakra-ui/react"
import {
  getTokenByAddressOrName, getTokenLogoURL, getTokenSocialInfofromCoingeckoAPI, getTokenSymbol
} from '../../api'
import {
  useTokenInfo,
  useDebounce,
  useLPTokenPrice
} from '../../hooks'
import {ERC20Token, SearchStatus} from '../../utils/type'
import * as constant from '../../utils/constant'
import TokenListItem from './TokenListItem'
import style from './TokenList.module.css'
import { SearchCross, SearchIcon, SearchIconMini } from '../../assests/icon'
import { SCREENNXL_SIZE } from '../../utils/constant'
import useSize from '../../hooks/useSize'
import Card from '../Card/card'
export default function TokenList({
  network,
  address
}:{
  network: string,
  address: string
}) {
  const listClass = useColorModeValue(
    style.tokenList + " " + style.tokenListLight,
    style.tokenList + " " + style.tokenListDark
  );
  
  const searchColor = useColorModeValue("#FFFFFF", "navy.600");
  const searchBorderColor = useColorModeValue("#CFCFCF", "navy.600");
  const {tokenData,setTokenData, listTokens, setListTokens} = useTokenInfo();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery.replace(/\s/g, ''), 500);
  const windowDimensions = useSize();

  const [activeToken, setActiveToken] = useState<ERC20Token>(tokenData);
  const debouncedActiveToken = useDebounce<ERC20Token>(activeToken, 100);
  const [foundToken, setFoundToken] = useState<ERC20Token[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(SearchStatus.notsearch);

  // const searchToken = async() => {
    
  //   if (debouncedQuery[0] == "0" && debouncedQuery[1] == "x") {
  //     let foundFlag = false;
  //     let foundEthToken:ERC20Token={
  //       contractAddress: "0x00",
  //       name: '',
  //       symbol: '',
  //       network: 0,
  //       price: 0,
  //       usdBalance: 0,
  //       decimals: 0,
  //       holdersCount: 0,
  //       balance:0,
  //       image: '',
  //       owner: '',
  //       totalSupply: 0,
  //       marketCap: '',
  //       pinSetting: false
  //     };
  //     let foundBscToken:ERC20Token={
  //       contractAddress: "0x00",
  //       name: '',
  //       symbol: '',
  //       network: 0,
  //       price: 0,
  //       usdBalance: 0,
  //       decimals: 0,
  //       holdersCount: 0,
  //       balance:0,
  //       image: '',
  //       owner: '',
  //       totalSupply: 0,
  //       marketCap: '',
  //       pinSetting: false
  //     };
  //     listTokens.map((element) => {
  //       if (element.contractAddress.toLowerCase() == debouncedQuery.toLowerCase())
  //       {
  //         if (element.network == constant.ETHEREUM_NETWORK){
  //           foundEthToken = element;
  //         } else if (element.network == constant.BINANCE_NETOWRK) {
  //           foundBscToken = element;
  //         }
  //         foundFlag = true;
  //       }
  //     });
  //     setSearchStatus(SearchStatus.searching);
  //     if (debouncedQuery.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ||
  //         debouncedQuery.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()
  //     ) {
  //       const network = debouncedQuery.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ? constant.ETHEREUM_NETWORK : constant.BINANCE_NETOWRK;
  //       const srg_response = await getTokenSymbol(debouncedQuery, network);
  //       if (srg_response != constant.NOT_FOUND_TOKEN) {
  //         const LINK = network == constant.ETHEREUM_NETWORK ? "https://etherscan.io/" : "https://bscscan.com/" ;
  //         const image = network == constant.ETHEREUM_NETWORK ? 
  //                       "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" :
  //                       "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";
  //         const srg_token = {
  //           name: srg_response[0],
  //           symbol: srg_response[1],
  //           network: network,
  //           contractAddress: network == constant.ETHEREUM_NETWORK ? constant.WHITELIST_TOKENS.ETH.SRG : constant.WHITELIST_TOKENS.BSC.SRG,
  //           price: 0,
  //           balance: 0,
  //           usdBalance: 0,
  //           decimals: srg_response[2],
  //           holdersCount: 0,
  //           txCount: srg_response[4],
  //           image: image,
  //           owner: "",
  //           totalSupply: srg_response[3],
  //           marketCap: "",
  //           website: "https://surgeprotocol.io/",
  //           facebook: "https://www.facebook.com/profile.php?id=100089005899983&mibextid=LQQJ4d",
  //           twitter: "https://twitter.com/SURGEPROTOCOL",
  //           medium: "https://medium.com/@thesurgedefi",
  //           instagra: "https://instagram.com/SURGEPROTOCOL",
  //           telegram: "https://t.me/surgeprotocol",
  //           discord: "",
  //           github: "",
  //           reddit: "",
  //           pinSetting: false,
  //           controller: undefined,
  //           contractCodeURL: LINK + "address/" + debouncedQuery +"#code",
  //           contractBalanceWalletURL: LINK + "token/" + debouncedQuery + "?a=",
  //           contractBalanceURL: LINK + "token/" + debouncedQuery + "#balances",
  //           contractPage:LINK + "token/" + debouncedQuery
  //         } as ERC20Token;
  //         if (network == constant.ETHEREUM_NETWORK) {
  //           foundEthToken = srg_token;
  //         } else {
  //           foundBscToken = srg_token;
  //         }
  //         foundFlag = true;
  //       }     
  //     } else {
  //         if (foundEthToken.contractAddress == "0x00") {
  //           const res_eth = await getTokenSymbol(debouncedQuery, constant.ETHEREUM_NETWORK);
  //           if (res_eth != constant.NOT_FOUND_TOKEN) {
  //             foundFlag = true;
  //             const ETHLINK = "  https://etherscan.io/";
  //             const logo = await getTokenLogoURL(debouncedQuery, constant.ETHEREUM_NETWORK, res_eth[1]);
  //             const social = await getTokenSocialInfofromCoingeckoAPI(debouncedQuery, constant.ETHEREUM_NETWORK);
  //             const token = {
  //               name: res_eth[0],
  //               contractAddress: debouncedQuery.toLowerCase(),
  //               price: 0,
  //               marketCap: "",
  //               totalSupply: res_eth[3],
  //               holdersCount: 0,
  //               balance: 0,
  //               decimals: res_eth[2],
  //               symbol: res_eth[1],
  //               image: logo,
  //               network: constant.ETHEREUM_NETWORK,
  //               pinSetting: false,
  //               website: social![0],
  //               twitter: social![1],
  //               facebook: social![2],
  //               discord: social![3],
  //               github: social![4],
  //               telegram: social![5],
  //               instagra: social![6],
  //               medium: social![7],
  //               reddit: social![8],
  //               controller: undefined,
  //               contractCodeURL: ETHLINK + "address/" + debouncedQuery +"#code",
  //               contractBalanceWalletURL: ETHLINK + "token/" + debouncedQuery + "?a=",
  //               contractBalanceURL: ETHLINK + "token/" + debouncedQuery + "#balances",
  //               contractPage:ETHLINK + "token/" + debouncedQuery
  //             } as ERC20Token;
  //             foundEthToken = token;
  //           }
  //         }
  //         if (foundBscToken.contractAddress == "0x00") {
  //           const BSCLINK = " https://bscscan.com/";
  //             const res_bsc = await getTokenSymbol(debouncedQuery, constant.BINANCE_NETOWRK);
  //             if (res_bsc != constant.NOT_FOUND_TOKEN) {
  //               foundFlag = true;
  //               const logo = await getTokenLogoURL(debouncedQuery, constant.BINANCE_NETOWRK, res_bsc[1]);
  //               const social = await getTokenSocialInfofromCoingeckoAPI(debouncedQuery, constant.BINANCE_NETOWRK);
  //               const token = {
  //                 name: res_bsc[0],
  //                 contractAddress: debouncedQuery.toLowerCase(),
  //                 price: 0,
  //                 marketCap: "",
  //                 totalSupply: res_bsc[3],
  //                 holdersCount: 0,
  //                 symbol: res_bsc[1],
  //                 balance: 0,
  //                 decimals: res_bsc[2],
  //                 image: logo,
  //                 network: constant.BINANCE_NETOWRK,
  //                 pinSetting: false,
  //                 website: social![0],
  //                 twitter: social![1],
  //                 facebook: social![2],
  //                 discord: social![3],
  //                 github: social![4],
  //                 telegram: social![5],
  //                 instagra: social![6],
  //                 medium: social![7],
  //                 reddit: social![8],
  //                 controller: undefined,
  //                 contractCodeURL: BSCLINK + "address/" + debouncedQuery +"#code",
  //                 contractBalanceWalletURL: BSCLINK + "token/" + debouncedQuery + "?a=",
  //                 contractBalanceURL: BSCLINK + "token/" + debouncedQuery + "#balances",
  //                 contractPage:BSCLINK + "token/" + debouncedQuery
  //               } as ERC20Token;
  //               foundBscToken = token;
  //             } 
  //         }
  //     }
  //     if(foundFlag == true){
  //       setFoundToken(foundToken.filter(
  //         item => (item.contractAddress != debouncedQuery.toLowerCase())
  //       ));     
  //       if (foundEthToken.contractAddress != "0x00"){
  //         setFoundToken(tokens=>[...tokens, foundEthToken]);     
  //       }   
  //       if (foundBscToken.contractAddress != "0x00") {
  //         setFoundToken(tokens=>[...tokens, foundBscToken]);  
  //       }
  //       setSearchStatus(SearchStatus.founddata);     
  //     } else {
  //       setFoundToken([]);
  //       setSearchStatus(SearchStatus.notsearch);
  //     }
  //   } else {
  //     setFoundToken([]);
  //     setSearchStatus(SearchStatus.notsearch);
  //   }
  // }

  const searchToken = async() => {
    
    if (debouncedQuery.length != 0) {

      let foundTokenTemp:ERC20Token[] = [];

      listTokens.map((element:ERC20Token) => {
        if (element.contractAddress.toLowerCase() == debouncedQuery.toLowerCase())
        {
          foundTokenTemp = [...foundTokenTemp, element];
        }
      });
      setSearchStatus(SearchStatus.searching);

      if (debouncedQuery.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ||
          debouncedQuery.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()
      ) {
        const network = debouncedQuery.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ? constant.ETHEREUM_NETWORK : constant.BINANCE_NETOWRK;
        const srg_response = await getTokenSymbol(debouncedQuery, network);
        if (srg_response != constant.NOT_FOUND_TOKEN) {
          const LINK = network == constant.ETHEREUM_NETWORK ? "https://etherscan.io/" : "https://bscscan.com/" ;
          const image = network == constant.ETHEREUM_NETWORK ? 
                        "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" :
                        "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";
          const srg_token = {
            name: srg_response[0],
            symbol: srg_response[1],
            network: network,
            contractAddress: network == constant.ETHEREUM_NETWORK ? constant.WHITELIST_TOKENS.ETH.SRG : constant.WHITELIST_TOKENS.BSC.SRG,
            price: 0,
            balance: 0,
            usdBalance: 0,
            decimals: srg_response[2],
            holdersCount: 0,
            txCount: srg_response[4],
            image: image,
            owner: "",
            totalSupply: srg_response[3],
            marketCap: "",
            website: "https://surgeprotocol.io/",
            facebook: "https://www.facebook.com/profile.php?id=100089005899983&mibextid=LQQJ4d",
            twitter: "https://twitter.com/SURGEPROTOCOL",
            medium: "https://medium.com/@thesurgedefi",
            instagra: "https://instagram.com/SURGEPROTOCOL",
            telegram: "https://t.me/surgeprotocol",
            discord: "",
            github: "",
            reddit: "",
            pinSetting: false,
            controller: undefined,
            contractCodeURL: LINK + "address/" + debouncedQuery +"#code",
            contractBalanceWalletURL: LINK + "token/" + debouncedQuery + "?a=",
            contractBalanceURL: LINK + "token/" + debouncedQuery + "#balances",
            contractPage:LINK + "token/" + debouncedQuery
          } as ERC20Token;
          foundTokenTemp.push(srg_token);
        }
      } else {
        foundTokenTemp = await getTokenByAddressOrName(debouncedQuery);
      }

      if(foundTokenTemp.length != 0){
        let tempArray = foundToken.filter(
          (item:ERC20Token) => (item.contractAddress != debouncedQuery.toLowerCase())
        );
        tempArray = [...tempArray, ...foundTokenTemp];
        setFoundToken(tempArray);
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
  }, [debouncedQuery]);

  useMemo(() => {
    if (debouncedActiveToken != undefined){
      const tempToken = debouncedActiveToken;
      tempToken.controller = new AbortController();
      setTokenData(tempToken);
    }
  }, [debouncedActiveToken])

  useMemo(() => {
    // const cookieString = getCookie("PinnedToken");
    const initAndLoad = async() => {
      const cookieString = localStorage.getItem("PinnedToken");
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
            txCount:obj["txCount"],
            image:obj["image"],
            marketCap:obj["marketCap"],
            network:obj["network"],
            price:obj["price"],
            decimals:obj["decimals"],
            totalSupply:obj["totalSupply"],
            pinSetting:obj["pinSetting"],
            website:obj["website"],
            twitter:obj["twitter"],
            facebook:obj["facebook"],
            discord:obj["discord"],
            github:obj["github"],
            telegram:obj["telegram"],
            instagra:obj["instagra"],
            medium:obj["medium"],
            reddit:obj["reddit"],
            contractCodeURL:obj["contractCodeURL"],
            contractBalanceWalletURL:obj["contractBalanceWalletURL"],
            contractBalanceURL:obj["contractBalanceURL"],
            contractPage:obj["contractPage"]
          } as ERC20Token;
          cookieToken.push(token);
        } catch(e){

        }
      });

      const network_number = network == "eth" ? constant.ETHEREUM_NETWORK : constant.BINANCE_NETOWRK;
      const findRes = cookieToken.find((value) => {
        if (value.contractAddress.toLowerCase() == address.toLowerCase() && value.network == network_number)
          return true;
      });
      if (findRes == undefined && network.length != 0 && address.length != 0) {

        const tokenFound = await getTokenByAddressOrName(address, network_number);
        if (tokenFound.length < 1)
          return;
        TokenActionHandler(tokenFound[0], true);
        setActiveTokenHandler(tokenFound[0]);
        setFoundToken((item: any) => [...item, tokenFound[0]]);
        setSearchStatus(SearchStatus.founddata);
      } else if (findRes != undefined){
        setActiveToken(findRes);
      }

      setListTokens(cookieToken); 
    }
    if (typeof window !== 'undefined') {
      initAndLoad();
    }
  }, [network, address]);

  const TokenActionHandler = (token:ERC20Token, add:boolean) => {
    let filterTokens = listTokens;
    filterTokens = filterTokens.filter((item:ERC20Token) => (item.contractAddress + item.network) != (token.contractAddress + token.network));

    filterTokens = filterTokens.sort((value1:ERC20Token, value2:ERC20Token) => {
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
    let newCookieString = "";
    filterTokens.forEach((token:ERC20Token) => {
      const obj = JSON.stringify(token);
      if (obj.indexOf(";") == -1) {
        newCookieString += obj;
        newCookieString += ";";
      }
    });
    localStorage.setItem("PinnedToken", newCookieString);
    setListTokens(filterTokens);
    // setCookie("PinnedToken", newCookieString);
  }

  const setActiveTokenHandler = (token:ERC20Token) => {
    setActiveToken(token);
    // setTokenData(token);
    if (searchStatus == SearchStatus.founddata) {
      setSearchQuery("");
      let filterTokens = listTokens;
      filterTokens = filterTokens.filter((item:ERC20Token) => (item.contractAddress + item.network) != (token.contractAddress + token.network)); 
      const unPinIndex = filterTokens.findIndex((value:any) => value.pinSetting == false);

      if (unPinIndex != -1)
        filterTokens.splice(unPinIndex, 0, token);
      else
        filterTokens.push(token);

      let newCookieString = "";
      filterTokens.forEach((token:ERC20Token) => {
        const obj = JSON.stringify(token);
        if (obj.indexOf(";") == -1) {
          newCookieString += obj;
          newCookieString += ";";
        }
      });
      localStorage.setItem("PinnedToken", newCookieString);
      setListTokens(filterTokens); 
    }
  }

  return (
    <Card w='420px' h='100%' p='0px' paddingTop='10px' paddingBottom='10px' minWidth='420px'>
      <Box className={listClass}>
        <Button height={"0px"}/>

        <Box className = {style.tokenSearch}>
          <InputGroup>
            <InputLeftElement
              paddingTop = {windowDimensions.width < SCREENNXL_SIZE ? '0px' : '7px'}
              paddingLeft= '5px'
              pointerEvents='none'
            >
              {
                windowDimensions.width < SCREENNXL_SIZE ?
                <SearchIconMini/>:
                <SearchIcon/>
              }
              
            </InputLeftElement>
            <Input 
              id='SearchId'
              placeholder='Search token Name, Symbol or Token address'
              _placeholder={{fontsize:windowDimensions.width < SCREENNXL_SIZE ? '0.5rem' :'1rem', fontcolor:"#E34B62"}}
              onChange={handleSearchChange} 
              onKeyDown={handleEnter}
              borderRadius={'2rem'}
              height={windowDimensions.width < SCREENNXL_SIZE ? '2rem' : '2.5rem'}
              background={searchColor}
              borderColor={searchBorderColor}
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
                  { debouncedQuery.length > 0 &&
                    <p style={{display:"flex", justifyContent:"center", width:"90%"}}> Search Result </p>
                  }
                  {
                    foundToken.map((token:ERC20Token, index:any) => {
                      return(
                        <TokenListItem
                          key={index}
                          listedTokenData = {token}
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
              debouncedQuery.length == 0 &&
              listTokens.map((token:ERC20Token, index:any) => {
                const alreadyListed = foundToken.find((element:ERC20Token) => (element.contractAddress + element.network) == (token.contractAddress + token.network));
                if (alreadyListed != undefined)
                  return;
                return (
                <TokenListItem
                  key={index}
                  listedTokenData = {token}
                  activeToken = {debouncedActiveToken!}
                  activeTokenHandler = {setActiveTokenHandler}
                  pinTokenHandler = {TokenActionHandler}
                />);      
              })
            }
          </Box>
      </Box>
    </Card>
  );
}

