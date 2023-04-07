import React, {useState, useEffect, useMemo, useRef} from 'react'
import { 
  Avatar,
  Box, 
  Button, 
  Divider, 
  Drawer, 
  DrawerBody, 
  DrawerContent, 
  DrawerOverlay, 
  HStack, 
  Tag, 
  TagLabel, 
  TagRightIcon, 
  VStack, 
  useColorMode, 
  useColorModeValue, 
  useDisclosure  
} from "@chakra-ui/react"
import {
  CopyAddressIconDark,
  CopyAddressIconLight,
  CoyAddressComfirm,
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
  getTokenHolderCount,
  getBuySellTaxFromTx
} from '../../api'
import style from './TokenInfo.module.css'
import * as constant from '../../utils/constant'
import LpTokenInfo from './LpTokenInfo'
import { ERC20Token, LPTokenPair, PlayMode, TokenSide } from '../../utils/type'
import { useStableCoinPrice } from '../../hooks/useStableCoinPrice'
import { useAddress } from '@thirdweb-dev/react'
import SocialListBox from './SocialListBox'
import useSize from '../../hooks/useSize'
import { SCREENMD_SIZE, SCREENNXL_SIZE, SCREENSM_SIZE } from '../../utils/constant'
import TokenDetails from './TokenDetails'
import TokenBalance from './TokenBalance'
import SwapTrade from '../WalletInfo/SwapTrade'
import WalletInfo from '../WalletInfo'
import Card from '../Card/card'
import { MdContentPaste, MdFileCopy, MdSettings, MdStar } from 'react-icons/md'


export default function TokenInfo({
  tokenData
}:{
  tokenData: ERC20Token
}) {

  const colorMode = useColorMode();
  const {buyTax, sellTax, setBuyTax, setSellTax} = useTokenInfo();
  const {walletTokens} = useWalletTokenBalance();
  const {lpTokenPrice, lpTokenAddress ,setLPTokenAddress} = useLPTokenPrice();
  const [tokenPriceshow, setTokenPriceShow] = useState<number>(0.0);
  
  const {transactionData} = useLPTransaction();
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
  const { isOpen : isMobileToggleOpen, onOpen: MobileToggleOpen, onClose: MobileToggleClose , onToggle: onMobileToggle} = useDisclosure();
  const { isOpen : isToggleOpen, onOpen: ToggleOpen, onClose: ToggleClose , onToggle} = useDisclosure();
  const firstField = useRef();
  const [marketinfoWidth, setMarketInfoWidth] = useState<number>(1000);
  const marketinfoRef = useRef(null);
  const {coinPrice} = useStableCoinPrice();
  const infoClass = useColorModeValue(
    style.tokenInfo + " " + style.tokenInfoLight,
    style.tokenInfo + " " + style.tokenInfoDark
  );

  const address = useAddress();
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  const infoborderColorMode = useColorModeValue("#E2E8F0","#233545");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');

  const setLPTokenListInfo = async() => {

    const findInd = lpTokenPinList.findIndex((value) => value.ownerToken?.toLowerCase() == tokenData.contractAddress.toLowerCase());
    if (findInd != -1) {
      setLPTokenAddress(lpTokenPinList[findInd]);
    }
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
      quoteCurrency_contractAddress:"",
      tokenside: TokenSide.token1,
      protocolType: ""
    } as LPTokenPair;    
    let token0_Res:any[] = [];
    if (tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() || 
        tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
      token0_Res.push({
        name: tokenData.network == constant.ETHEREUM_NETWORK ? "SRG/WETH" : "SRG/WBNB",
        symbol: tokenData.network == constant.ETHEREUM_NETWORK ? "SRG/WETH" : "SRG/WBNB",
        contractAddress: tokenData.contractAddress,
        price: 0,
        marketCap: "",
        totalSupply: 0,
        holdersCount: 0,
        balance: 0,
        decimals: tokenData.decimals,
        quoteCurrency_contractAddress:"",
        image: "",
        network: tokenData.network,
        token0_name: tokenData.symbol,
        token1_name: tokenData.network == constant.ETHEREUM_NETWORK ? "WETH" : "WBNB",
        token0_reserve: 0,
        token1_reserve: 0,
        token0_contractAddress: tokenData.contractAddress,
        token1_contractAddress: tokenData.network == constant.ETHEREUM_NETWORK ? constant.WHITELIST_TOKENS.ETH.ETH : constant.WHITELIST_TOKENS.BSC.BNB,
        tokenside: TokenSide.token1,
        protocolType: ""
      } as LPTokenPair)
    } else {
      token0_Res = await getLPTokenList(tokenData.contractAddress, tokenData.network, TokenSide.token1, tokenData);
    }
    // const token1_Res = await getLPTokenList(tokenData.contractAddress, tokenData.network, TokenSide.token0);
    
    setLPTokenList([]);
    const lptoken_Res = token0_Res;//token0_Res.concat(token1_Res);

    let index = 0;
    if (lptoken_Res.length == 0) {
      setLPTokenAddress(emptyLP);       
      return;
    }
    let lpToken_temp: LPTokenPair[] = [];
    let selectLP_temp : LPTokenPair = emptyLP;
    if (tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ||
        tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
      const res = await getLPTokenReserve(tokenData.contractAddress, tokenData.network);
      selectLP_temp = token0_Res[0];
      selectLP_temp.baseCurrency_contractAddress = tokenData.contractAddress;
      selectLP_temp.baseCurrency_decimals = tokenData.decimals;
      selectLP_temp.baseCurrency_name = tokenData.symbol;
      selectLP_temp.quoteCurrency_contractAddress = token0_Res[0].token1_contractAddress;
      selectLP_temp.quoteCurrency_name = token0_Res[0].token1_name;
      selectLP_temp.quoteCurrency_decimals = 18;
      selectLP_temp.ownerToken = tokenData.contractAddress;
      selectLP_temp.token1_reserve = res[1];
    } else {
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
    } 
    setLPTokenAddress(selectLP_temp);
    setLPTokenList(lpToken_temp);    
  }
  const setTokenInfo = async() => {
    const burn_res = await getTokenBurnAmount(tokenData.contractAddress, tokenData.network);
    const holderCnt = await getTokenHolderCount(tokenData.contractAddress, tokenData.network);
    const res = await getTokenTransactionCount(tokenData.contractAddress, tokenData.network, tokenData);
    setTransactionCount(res);
    setHoldersCount(holderCnt);
    if (!isNaN(burn_res))
      setBurnAmount(burn_res);
  }

  const setBuySellTax = async() => {
    // if (buyTax == 0 && sellTax == 0) {
      const res = await getBuySellTaxFromTx(
        transactionData, 
        lpTokenAddress
      );
      setBuyTax(res[0]);
      setSellTax(res[1]);
    // }
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

  useMemo(() => {
    if (tokenData != undefined && tokenData.contractAddress.length > 0) {
      addPinLPToken();
      setLPTokenListInfo();
      setDexDropShow(0);
    }
  }, [tokenData])

  useMemo(() => {
    if (typeof window !== 'undefined') {
      getLastLpTokenList();
    }
  }, [])
 
  useMemo(() => {
    if (windowDimensions.width < SCREENMD_SIZE && windowDimensions.width > 0) {
      setMobileVersion(true);
    } else {
      setMobileVersion(false);
      ToggleClose();
    }
  }, [windowDimensions])
  
  useMemo(() => {
    if (transactionData.length > 0 && lpTokenAddress.token0_reserve != 0) {
      setTokenInfo();
      setBuySellTax();
    }
  }, [transactionData, lpTokenAddress])
  
  useMemo(() => {
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

    if (lpTokenPrice != undefined && tokenData != undefined)
      setTokneBalanceAndPrice();
  }, [walletTokens, tokenData, lpTokenPrice])

  useEffect(() => {
    setMarketInfoWidth(marketinfoRef.current.clientWidth);
  }, [marketinfoRef, windowDimensions]);
  
  return (
    <Box className={infoClass}>
      <Box className={style.tokenSocialInfo} borderBottom={"1px"} borderBottomColor = {infoborderColorMode}>
        <Box display={"flex"} flexDirection={"row"} width={isMobileVersion ? "95%" : "85%"} alignItems={"center"} justifyContent={"space-between"} paddingLeft={"1.5rem"}>
          <Box display={"flex"} flexDirection={"row"} width={"100%"} alignItems={"center"}>
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={windowDimensions.width < SCREENMD_SIZE ? "start" : "center"}
              width={windowDimensions.width < SCREENMD_SIZE ? "3rem" : "50px"}
              height={windowDimensions.width < SCREENMD_SIZE ? "4rem" : "50px"}
            >
              <img src={tokenData.image} />
            </Box>
            {/* <Box display={"flex"} flexDirection={"column"} paddingLeft={"0.5rem"} alignItems={"flex-start"} width={"100%"}> */}
            
            <VStack paddingTop = {windowDimensions.width > SCREENNXL_SIZE ? "0px" : "10px"} alignItems={'flex-start'} marginLeft={'10px'}>
              <HStack>
                <p className={style.tokenName} 
                  style={{color:"#767676", fontSize:windowDimensions.width < SCREENSM_SIZE ? "12px" : "1.2rem"}}
                >
                  {isMobileVersion ? `${makeShortTokenName(lpTokenAddress.baseCurrency_name, 5)}/${makeShortTokenName(lpTokenAddress.quoteCurrency_name, 4)}` :lpTokenAddress.symbol}
                </p>
                <Tag borderRadius={'full'} bg={'navy.400'}>
                  <TagLabel className={style.tokenAddress}>{makeShortAddress(tokenData?.contractAddress!, 7, 4)}</TagLabel>
                  <TagRightIcon as={MdFileCopy} cursor={'pointer'} onClick={copyBtnClick}/>
                </Tag>
                <Avatar as={MdStar} cursor={'pointer'} width={'24px'} height={'24px'} bg={'#203243'} p={'3px'} color={'yellow'}></Avatar>
              </HStack>
              <p className={style.tokenName} style={{marginTop:'0px'}}>{tokenData.name}</p>
              {/* {
                !isMobileVersion && 
                <p className={style.tokenPrice} style={{color:priceColor}}>{convertBalanceCurrency( tokenPriceshow, 9)}</p>
              } */}
            </VStack>
              {/* {
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
              } */}
          </Box>
          {/* {
            !isMobileVersion && 
            <SocialListBox
              token={tokenData}
            />
          } */}
          <TokenDetails
              label1={'Holders'}
              label2={'Transactions'}
              holdersCount = {holdersCount}
              transactionCount = {transactionCount}
              tokenData = {tokenData}
              width = {"25%"}
            />
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
            <p 
              className={style.tokenPrice} 
              style={{color:priceColor}}
            >
              {tokenPriceshow < 1 ? convertBalanceCurrency( tokenPriceshow, 9) : convertBalanceCurrency( tokenPriceshow, 2)}
            </p>
            {/* <Box
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
                marginRight={"2rem"}
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
            </Drawer>             */}
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
          width={isMobileVersion ? "100%" : "85%"} 
          height={"100%"} 
          alignItems={"center"} 
          ref = {marketinfoRef}
        >
          <Box 
            display={"inline-block"} 
            flexDirection={"column"} 
            width={!isMobileVersion && "20%"} 
            paddingRight={isMobileVersion && "2.5rem"} 
            minWidth={isMobileVersion && "5%"}
            float={"right"}
          >
            <p className={style.marketCap} style={{color:textColor}} >Market Cap</p>
            <p 
              className={style.tokenMarketCap} 
              style={{color:priceColor}}
            >
              {isMobileVersion ? 
              makeShortTokenName(convertBalanceCurrency((tokenData.totalSupply-burnAmount) * tokenPriceshow, 0), 14) :
              convertBalanceCurrency((tokenData.totalSupply-burnAmount) * tokenPriceshow, 0)}
            </p>
          </Box>
          <Box
            display={"flex"} 
            flexDirection={"column"} 
            width={isMobileVersion ? "auto" : "30%"}  
            maxWidth={isMobileVersion && "90%"}
            position={"relative"} 
            height={"100%"}
            top={windowDimensions.width > SCREENNXL_SIZE ? "0.4rem" : "0.1rem"}
          >
            <LpTokenInfo 
              lpToken={lpTokenAddress} 
              dropListHandler ={setDexDropShow}
              showArrow = {true}
              setLPTokenHandler = {setLpTokenItem}
              isLast = {false}
              lpTokenList = {lpTokenList}
              marketInfoWidth = {marketinfoWidth}
            />
            <Box 
              id="dexlist" 
              style={{
                maxHeight:"15rem", 
                display:"none", 
                position:"absolute", 
                top:windowDimensions.width > SCREENNXL_SIZE ? "63px" : "53px", 
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
              <TokenBalance
                balance = {balance}
                balanceUSD = {balanceUSD}
                tokenData = {tokenData}
                width = {"29%"}
              />
              
              <TokenDetails
                label1={'Buy'}
                label2={'Sell'}
                holdersCount = {holdersCount}
                transactionCount = {transactionCount}
                tokenData = {tokenData}
                width = {"20%"}
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
              label1={'24h Change'}
              label2={'25h Vol'}
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