import React, {useState, useEffect, useMemo, useRef} from 'react'
import { Box, Button, Divider, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, VStack, useBreakpoint, useBreakpointValue, useColorMode, useColorModeValue, useDisclosure  } from "@chakra-ui/react"
import {
  CopyAddressIconDark,
  CopyAddressIconLight,
  CoyAddressComfirm,
  TokenDetailsDark,
  DownArrowDark,
  DownArrowLight,
  CoyAddressComfirmMini,
  CopyAddressIconMiniDark,
  CopyAddressIconMiniLight,
  MoreInfoIcon
} from "../../assests/icon"
import {
  useTokenInfo,
  useLPTokenPrice,
  useWalletTokenBalance,
  useLPTransaction
} from '../../hooks'
import { 
  convertBalanceCurrency,
  numberWithCommasTwoDecimals,
  numberWithCommasNoDecimals,
  makeShortTokenName,
  makeShortAddress
} from '../../utils'
import {
  getLPTokenReserve,
  getTokenTransactionCount,
  getLPTokenList,
  getTokenBurnAmount,
  getTokenBalance,
  getTokenHolderCount
} from '../../api'
import style from './TokenInfo.module.css'
import * as constant from '../../utils/constant'
import LpTokenInfo from './LpTokenInfo'
import { LPTokenPair, PlayMode, TokenSide } from '../../utils/type'
import { useStableCoinPrice } from '../../hooks/useStableCoinPrice'
import { useAddress } from '@thirdweb-dev/react'
import SocialListBox from './SocialListBox'
import useSize from '../../hooks/useSize'
import { SCREENMD_SIZE, SCREENNXL_SIZE, SCREENSM_SIZE } from '../../utils/constant'
import TokenDetails from './TokenDetails'
import TokenBalance from './TokenBalance'
import SwapTrade from '../WalletInfo/SwapTrade'
import TokenList from '../TokenList'
import MenuBar from '../MenuBar'
import WalletInfo from '../WalletInfo'
import { isMotionValue } from 'framer-motion'


export default function TokenInfo() {

  const colorMode = useColorMode();
  const {tokenData} = useTokenInfo();
  const {walletTokens} = useWalletTokenBalance();
  const {lpTokenPrice, lpTokenAddress ,setLPTokenAddress} = useLPTokenPrice();
  const [tokenPriceshow, setTokenPriceShow] = useState<number>(0.0);
  
  const [isMobileVersion, setMobileVersion] = useState<boolean>(false);
  const [lpTokenList, setLPTokenList] = useState<LPTokenPair[]>([]);
  const [lpTokenPinList, setLPTokenPinList] = useState<LPTokenPair[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);
  const priceColor = useColorModeValue("#00B112","#00C514");
  const drawerbgColor = useColorModeValue("#FEFEFE", "#1C1C1C");

  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [burnAmount, setBurnAmount] = useState<number>(0);
  const [holdersCount, setHoldersCount] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const windowDimensions = useSize();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSidebarOpen, onOpen: SidebarOpen, onClose: SidebarClose } = useDisclosure();
  const { isOpen : isMobileToggleOpen, onOpen: MobileToggleOpen, onClose: MobileToggleClose , onToggle: onMobileToggle} = useDisclosure();
  const { isOpen : isToggleOpen, onOpen: ToggleOpen, onClose: ToggleClose , onToggle} = useDisclosure();
  const firstField = useRef()
  const marketCapRef = useRef(null);
  const marketinfoRef = useRef(null);
  const {coinPrice} = useStableCoinPrice();
  const infoClass = useColorModeValue(
    style.tokenInfo + " " + style.tokenInfoLight,
    style.tokenInfo + " " + style.tokenInfoDark
  );

  const address = useAddress();
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const infoborderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');

  const setLPTokenListInfo = async() => {
    const findInd = lpTokenPinList.findIndex((value) => value.ownerToken?.toLowerCase() == tokenData.contractAddress.toLowerCase());
    if (findInd != -1) {
      setLPTokenAddress(lpTokenPinList[findInd]);
    }
    const token0_Res = await getLPTokenList(tokenData.contractAddress, tokenData.network, TokenSide.token1);
    // const token1_Res = await getLPTokenList(tokenData.contractAddress, tokenData.network, TokenSide.token0);
    
    setLPTokenList([]);
    const lptoken_Res = token0_Res;//token0_Res.concat(token1_Res);
    const emptyLP = {
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
      tokenside: TokenSide.token1,
      protocolType: "",
    } as LPTokenPair;
    let index = 0;
    if (lptoken_Res.length == 0) {
      setLPTokenAddress(emptyLP);       
      return;
    }
    let lpToken_temp: LPTokenPair[] = [];
    let selectLP_temp : LPTokenPair = emptyLP;
    for await (const value of lptoken_Res) {
      if (value.protocolType == "Uniswap v3")
        continue;
      const res = await getLPTokenReserve(value.contractAddress, value.network);
      if (res[2].toLowerCase() != constant.PANCAKESWAP_FACTORY.v2.toLowerCase() && res[2].toLowerCase() != constant.UNISWAP_FACTORY.v2.toLowerCase())
        continue;

      if (res[3].toLowerCase() == tokenData.contractAddress.toLowerCase()) {
        value.tokenside = TokenSide.token0;
      } else if (res[4].toLowerCase() == tokenData.contractAddress.toLowerCase()) {
        value.tokenside = TokenSide.token1;
      }
      if (value.baseCurrency_contractAddress?.toLowerCase() == res[3].toLowerCase()) {

        value.token0_contractAddress = value.baseCurrency_contractAddress!;
        value.token0_decimal = value.baseCurrency_decimals!;
        value.token0_name = value.baseCurrency_name!;

        value.token1_contractAddress = value.quoteCurrency_contractAddress!;
        value.token1_decimal = value.quoteCurrency_decimals!;
        value.token1_name = value.quoteCurrency_name!;

      } else {

        value.token1_contractAddress = value.baseCurrency_contractAddress!;
        value.token1_decimal = value.baseCurrency_decimals!;
        value.token1_name = value.baseCurrency_name!;

        value.token0_contractAddress = value.quoteCurrency_contractAddress!;
        value.token0_decimal = value.quoteCurrency_decimals!;
        value.token0_name = value.quoteCurrency_name!;

      }
      value.token0_reserve = res[0] / Math.pow(10, value.token0_decimal!);
      value.token1_reserve = res[1] / Math.pow(10, value.token1_decimal!);

      if (tokenData.contractAddress.toLowerCase() == value.token0_contractAddress.toLowerCase()){
        value.price = value.token1_reserve / value.token0_reserve;  
      } else {
        value.price = value.token0_reserve / value.token1_reserve;  
      }

      let price = 1;
      const coin = coinPrice.find((coinToken:any) => coinToken.contractAddress.toLowerCase() + coinToken.network ==
                    value.token1_contractAddress + value.network);
      
      if (coin != undefined)
        price = coin.price;

      if (index == 0) {
        selectLP_temp = value;
      }
      else if (value.token0_reserve> selectLP_temp.token0_reserve) {
        lpToken_temp.push(selectLP_temp);
        selectLP_temp = value;
      }
      else {
        lpToken_temp.push(value);
      }
      index ++;

    }
    setLPTokenAddress(selectLP_temp);
    setLPTokenList(lpToken_temp);    
  }
  const setTokenInfo = async() => {
    const burn_res = await getTokenBurnAmount(tokenData.contractAddress, tokenData.network);
    const res = await getTokenTransactionCount(tokenData.contractAddress, tokenData.network);
    const holderCnt = await getTokenHolderCount(tokenData.contractAddress, tokenData.network);
    setHoldersCount(holderCnt);
    setTransactionCount(res);
    if (!isNaN(burn_res))
      setBurnAmount(burn_res);
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
    // setCookie("PinnedLPToken", newCookieString);
    localStorage.setItem("PinnedLPToken", newCookieString);
  }

  const getLastLpTokenList = () => {
    // const cookieString = getCookie("PinnedLPToken");
    const cookieString = localStorage.getItem("PinnedLPToken");
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
    if (windowDimensions.width < SCREENMD_SIZE) {
      setMobileVersion(true);
    } else {
      setMobileVersion(false);
      ToggleClose();
    }
  }, [windowDimensions])
  
  useEffect(() => {

    const setTokneBalanceAndPrice = async() => {
      let tp = 0.0;
      if (lpTokenPrice.lpBaseTokenAddress.toLowerCase() == tokenData.contractAddress.toLowerCase()) {
        tp = lpTokenPrice.tokenPrice;
      }

      const bal = await getTokenBalance(
        tokenData.contractAddress,
        address, 
        tokenData.network
      );
        
      if (bal != constant.NOT_FOUND_TOKEN) {
        setBalance(parseFloat(bal));
        setBalanceUSD(parseFloat(bal) * tp);
      } else {
        setBalance(0);
        setBalanceUSD(0);
      }
      setTokenPriceShow(tp);
    }

    setTokneBalanceAndPrice();
  }, [walletTokens, tokenData, lpTokenPrice])
  
  return (
    <Box className={infoClass}>
      <Box className={style.tokenSocialInfo} borderBottom={"1px"} borderBottomColor = {infoborderColorMode}>
        <Box display={"flex"} flexDirection={"row"} width={isMobileVersion ? "95%" : "85%"} alignItems={"center"} justifyContent={"space-between"} paddingLeft={"1.5rem"}>
          <Box display={"flex"} flexDirection={"row"} width={isMobileVersion ? "100%" : "59%"} alignItems={"center"}>
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"start"}
              width={windowDimensions.width < SCREENSM_SIZE ? "3rem" : "50px"}
              height={windowDimensions.width < SCREENSM_SIZE ? "4rem" : "50px"}
            >
              <img src={tokenData.image} />
            </Box>
            <Box display={"flex"} flexDirection={"column"} paddingLeft={"0.5rem"} alignItems={"flex-start"} width={"100%"}>
              <Box display={"flex"} flexDirection={"row"} paddingTop = {windowDimensions.width > SCREENNXL_SIZE ? "0px" : "13px"}>
                <p className={style.tokenName}>{isMobileVersion ? makeShortTokenName(tokenData.symbol, 4) : tokenData.symbol}</p>
                <p className={style.tokenName} 
                   style={{color:"#767676", fontSize:windowDimensions.width < SCREENSM_SIZE ? "12px" : "1.2rem"}}
                >
                  &nbsp;({isMobileVersion ? `${makeShortTokenName(lpTokenAddress.baseCurrency_name, 4)}/${makeShortTokenName(lpTokenAddress.quoteCurrency_name, 4)}` :lpTokenAddress.symbol})&nbsp;&nbsp;
                </p>
                {
                  !isMobileVersion && 
                  <p className={style.tokenPrice} style={{color:priceColor}}>{convertBalanceCurrency( tokenPriceshow, 9)}</p>
                }
              </Box>
              {
                !isMobileVersion?
                <Box 
                  display={"flex"} 
                  flexDirection={"row"} 
                  alignItems={"center"} 
                  justifyContent={"center"} 
                  _hover={{"textDecoration":"underline"}}
                  cursor="pointer"
                >
                  <a className={style.tokenAddress} 
                    style={{color:"#767676"}}
                    href = {tokenData.contractCodeURL}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {
                      windowDimensions.width > SCREENSM_SIZE ?
                      tokenData.contractAddress :
                      makeShortAddress(tokenData.contractAddress, 7, 5)
                    }
                  </a>
                  <Box onClick={copyBtnClick}>
                    
                    {
                      copyStatus ? windowDimensions.width > SCREENNXL_SIZE ? <CoyAddressComfirm/> : <CoyAddressComfirmMini/> :
                      colorMode.colorMode == "dark" ?
                      windowDimensions.width > SCREENNXL_SIZE ? <CopyAddressIconDark cursor={"pointer"}/> : <CopyAddressIconMiniDark cursor={"pointer"}/> :
                      windowDimensions.width > SCREENNXL_SIZE ? <CopyAddressIconLight cursor={"pointer"}/> : <CopyAddressIconMiniLight cursor={"pointer"}/>
                    }
                  </Box>
                </Box>                  
                :
                <Box
                  width={"100%"}
                  display={"flex"}
                  flexDirection={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                  >
                    
                    <Box 
                      display={"flex"} 
                      flexDirection={"row"} 
                      alignItems={"center"} 
                      _hover={{"textDecoration":"underline"}}
                      cursor="pointer"
                    >
                      <a className={style.tokenAddress} 
                        style={{color:"#767676"}}
                        href = {tokenData.contractCodeURL}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                          {makeShortAddress(tokenData.contractAddress, 7, 5)}
                      </a>
                      <Box onClick={copyBtnClick}>
                        
                        {
                          copyStatus ? windowDimensions.width > SCREENNXL_SIZE ? <CoyAddressComfirm/> : <CoyAddressComfirmMini/> :
                          colorMode.colorMode == "dark" ?
                          windowDimensions.width > SCREENNXL_SIZE ? <CopyAddressIconDark cursor={"pointer"}/> : <CopyAddressIconMiniDark cursor={"pointer"}/> :
                          windowDimensions.width > SCREENNXL_SIZE ? <CopyAddressIconLight cursor={"pointer"}/> : <CopyAddressIconMiniLight cursor={"pointer"}/>
                        }
                      </Box>
                      
                    </Box>  
                    <p 
                      className={style.tokenPrice} 
                      style={{color:priceColor}}
                    >
                      {tokenPriceshow < 1 ? convertBalanceCurrency( tokenPriceshow, 9) : convertBalanceCurrency( tokenPriceshow, 2)}
                    </p>
                    
                  </Box>
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    alignItems={"center"}
                    justifyItems={"center"}
                    width = {"6rem"}
                    marginTop={"-2.2rem"}
                  >
                    <Button
                      width={"100%"}
                      height ={"1.5rem"}
                      marginBottom={"0.5rem"}
                      fontSize={"0.8rem"}
                      onClick = {onOpen}
                      paddingInlineStart={"0.5rem"}
                      paddingInlineEnd={"0.5rem"}
                    >
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        width={"100%"}
                        alignItems={"center"}
                        justifyContent={"space-around"}
                        fontSize={"0.7rem"}
                        color={"#5C5C5C"}
                      >
                        <p>
                          More Info
                        </p>
                        <MoreInfoIcon/>
                      </Box>
                    </Button>
                    <Drawer
                      isOpen={isOpen}
                      placement = 'right'
                      onClose={onClose}
                      initialFocusRef={firstField}
                      isFullHeight = {false}
                    >
                      <DrawerOverlay/>
                      <DrawerContent minW={{sm:400}} height={"12.5rem"} >
                        <DrawerBody p = {0} bg = {drawerbgColor}>
                          <Box
                            width={"100%"}
                            height = {"100%"}
                            display = {"flex"}
                            flexDirection = {"column"}
                            justifyContent = {"center"}
                            padding = {"1rem"}
                          >
                            <Box
                              display={"flex"}
                              flexDirection={"column"}
                            >
                              <p className={style.holder} style={{color:textColor}}>Total Supply</p>
                              <p className={style.tokenTotalSupply} color={whiteBlackMode}>{tokenData.totalSupply != null ? 
                                numberWithCommasNoDecimals(tokenData.totalSupply) :
                                0}</p>
                            </Box>
                            <Divider/>
                            <TokenDetails
                              holdersCount = {holdersCount}
                              transactionCount = {transactionCount}
                              tokenData = {tokenData}
                              width = {"100%"}
                            />
                            <Divider/>
                            <TokenBalance
                              balance = {balance}
                              balanceUSD = {balanceUSD}
                              tokenData = {tokenData}
                              width = {"100%"}
                            />       
                            <Divider/>
                            <Box
                              display={"flex"}
                              marginTop = {"0.2rem"}
                            >
                              <SocialListBox
                                token={tokenData}
                              />
                            </Box>
                          </Box>
                        </DrawerBody>
                      </DrawerContent>
                    </Drawer>                       
                    <Button
                      onClick={onMobileToggle}
                      _hover= {{bg:"#0085FF"}}
                      backgroundColor = "#0085FF"
                      color={"#FFFFFF"}
                      fontSize={"0.8rem"}
                      width={"100%"}
                    >
                      TRADE
                    </Button>
                    <Drawer
                      isOpen={isMobileToggleOpen}
                      placement = 'bottom'
                      onClose={MobileToggleClose}
                      initialFocusRef={firstField}
                      isFullHeight = {false}
                    >
                      <DrawerOverlay/>
                      <DrawerContent height={"27rem"} >
                        <DrawerBody p = {0} bg = {drawerbgColor}>
                        <Box
                          display={"flex"}
                          justifyContent={"center"}
                          paddingTop = {"1rem"}
                        >
                          <SwapTrade
                            mobileVersion={true}
                          />
                        </Box>
                        </DrawerBody>
                      </DrawerContent>
                    </Drawer>
                  </Box>                     
                </Box> 
              }
            </Box>
          </Box>
          {
            !isMobileVersion && 
            <SocialListBox
              token={tokenData}
            />
          }
        </Box>
        
        {
          !isMobileVersion &&
          <div className={style.border} style={{borderColor:infoborderColorMode}}/>
        }
        {
          !isMobileVersion &&
          <Box
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            width={"25%"}
          >
            <Box
              width = {"60%"}
              display={"flex"}
              flexDirection={"column"}         
            >
              <p className={style.holder} style={{color:textColor}}>Total Supply</p>
              <p className={style.tokenTotalSupply} color={whiteBlackMode}>{tokenData.totalSupply != null ? 
                numberWithCommasNoDecimals(tokenData.totalSupply) :
                0}</p>
            </Box>
            {
              windowDimensions.width < SCREENNXL_SIZE && 
              <Button
                onClick={onToggle}
                _hover= {{bg:"#0085FF"}}
                backgroundColor = "#0085FF"
                color="#FFFFFF"
                fontSize={"0.8rem"}     
                height={"1.8rem"}       
              >
                TRADE
              </Button>
            }
            
            <Drawer
              isOpen={isToggleOpen}
              placement = 'right'
              onClose={ToggleClose}
              initialFocusRef={firstField}
              isFullHeight = {false}
            >
              <DrawerOverlay/>
              <DrawerContent minW={{sm:455}}>
                <DrawerBody p = {0}>
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    width={"100%"}
                    height={"100%"}
                  >
                    <WalletInfo
                     tradeVisible={true}
                     hoverMenu = {true}
                    />
                  </Box>
                </DrawerBody>
              </DrawerContent>
            </Drawer>            
          </Box>
        }
      </Box>
      <Box 
        className={style.tokenMarktetInfo} 
        alignItems={"center"} 
        borderBottom={"1px"} 
        borderBottomColor = {infoborderColorMode}
      >
        <Box 
          display={"flex"} 
          flexDirection={"row"} 
          width={isMobileVersion ? "100%" : "83%"} 
          height={"100%"} 
          alignItems={"center"} 
        >
          <Box 
            display={"inline-block"} 
            flexDirection={"column"} 
            width={!isMobileVersion && "28%"} 
            paddingLeft={isMobileVersion ? "0rem" : windowDimensions.width < SCREENNXL_SIZE ? "3.5rem" : "4rem"} 
            paddingRight={isMobileVersion && "2.5rem"} 
            minWidth={isMobileVersion && "5%"}
            float={"right"}
          >
            <p className={style.marketCap} style={{color:textColor}} >Market Cap</p>
            <p className={style.tokenMarketCap} style={{color:priceColor}}>{isMobileVersion ? makeShortTokenName(convertBalanceCurrency((tokenData.totalSupply-burnAmount) * tokenPriceshow, 0), 14) :convertBalanceCurrency((tokenData.totalSupply-burnAmount) * tokenPriceshow, 0)}</p>
          </Box>
          <div style={{
            height:"90%",
            borderWidth:"0.5px",
            borderColor:infoborderColorMode,
          }}/>
          <Box
            display={"flex"} 
            flexDirection={"column"} 
            width={isMobileVersion ? "auto" : "40%"}  
            maxWidth={isMobileVersion && "90%"}
            position={"relative"} 
            height={"100%"}
            top={windowDimensions.width > SCREENNXL_SIZE ? "0.4rem" : "0rem"}
          >
            <LpTokenInfo 
              lpToken={lpTokenAddress} 
              dropListHandler ={setDexDropShow}
              showArrow = {true}
              setLPTokenHandler = {setLpTokenItem}
              isLast = {false}
              lpTokenList = {lpTokenList}
            />
            <Box 
              id="dexlist" 
              style={{
                maxHeight:"15rem", 
                display:"none", 
                position:"absolute", 
                top:windowDimensions.width > SCREENNXL_SIZE ? "3.9rem" : "3.5rem", 
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
                      lpTokenList = {lpTokenList}
                    />
                  );
                })
              }
            </Box>
          </Box>      
          {
            !isMobileVersion &&
            <>
              <div style={{
                marginRight:"1rem",
                height:"90%",
                borderWidth:"1px",
                borderColor:infoborderColorMode,
              }}/> 
              <TokenBalance
                balance = {balance}
                balanceUSD = {balanceUSD}
                tokenData = {tokenData}
                width = {"39%"}
              />
              
              <div style={{
                marginRight:"1rem",
                height:"90%",
                borderWidth:"1px",
                borderColor:infoborderColorMode,
              }}/>
            </>   
          }
        </Box>
        {
          !isMobileVersion  &&
            <TokenDetails
              holdersCount = {holdersCount}
              transactionCount = {transactionCount}
              tokenData = {tokenData}
              width = {"25%"}
            />
        }
      </Box>
    </Box>
  );
}