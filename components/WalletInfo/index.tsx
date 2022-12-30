import React, {useEffect, useRef, useState} from 'react'
import { 
  Box, 
  Button, 
  Input,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  useColorModeValue,
  calc,
  TableContainer,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from "@chakra-ui/react"
import {
  useNetwork,
  useAddress,
} from '@thirdweb-dev/react'
import {
  getContractInfoFromWalletAddress
} from '../../api'
import {ERC20Token} from '../../utils/type'
import { 
  convertBalanceCurrency,
  deleteCookie,
  makeShortTokenName,
  numberWithCommasTwoDecimals
} from '../../utils'
import {Refresh, SearchCross, SearchIcon} from '../../assests/icon'
import style from './WalletInfo.module.css'
import * as constant from '../../utils/constant'
import { 
  useLPTokenPrice,
  useTokenInfo,
  useWalletTokenBalance 
} from '../../hooks'
import SwapTrade from './SwapTrade'

export default function WalletInfo() {
  const titleClass = useColorModeValue(
    style.walletTitle + " " + style.walletTitleLight, 
    style.walletTitle + " " + style.walletTitleDark
  );
  const walletClass = useColorModeValue(
    style.walletInfo + " " + style.walletInfoLight,
    style.walletInfo + " " + style.walletInfoDark
  );
  const searchClass = useColorModeValue(
    style.tokenSearch + " " + style.tokenSearchLight,
    style.tokenSearch + " " + style.tokenSearchDark,
  );

  const {setWalletTokens} = useWalletTokenBalance();
  const {tokenData, setTokenData} = useTokenInfo();
  const widgetfontColor = useColorModeValue("#000000", "#FFFFFF");
  const selectBtnColor ="#0085FF";// useColorModeValue("#0070D7","#494949");
  const searchColor = useColorModeValue("#FFFFFF", "#323232");
  const searchBorderColor = useColorModeValue("#CFCFCF", "#323232");
  const notSelectBtnColor = useColorModeValue("#E0E0E0","#1C1C1C");
  const tokenColor = useColorModeValue("#1C1C1C","#FFFFFF");
  const refreshBtnBgColor = useColorModeValue("#FFFFFF","#1C1C1C");
  const refreshBtnBorderColor = useColorModeValue("#CFCFCF","#5c5c5c");
  const hoverColor = useColorModeValue("#005CE5","#3A3A29");
  const headerColor = useColorModeValue("#FFFFFF", "#262626");
  const priceColor = useColorModeValue("#00B112","#00C514");
  const tableBodyBorder = useColorModeValue(style.walletTokenBodyBorderLight,style.walletTokenBodyBorderDark);
  const tableHeadBorder = useColorModeValue(style.walletTokenHeadBorderLight,style.walletTokenHeadBorderDark);
  const address = useAddress();
  const network = useNetwork();
  const walletRef = useRef(null);
  
  const [widgetOption, setWidgetOption] = useState<Boolean>(true);
  const [borderWidth, setBorderWidth] = useState(0);
  const [searchContext, setSearchContext] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [tokensInfo, setTokensInfo] = useState<ERC20Token[]>([]);
  const [initTokensInfo, setInitTokensInfo] = useState<ERC20Token[]>([]);
  const {lpTokenAddress, setLPTokenAddress} = useLPTokenPrice();

  const handleSearchChange = (e: { target: { value: string; }; }) => {
    const { value } = e.target;
    setSearchContext(value);    
    let tempTokens = initTokensInfo;
    const temp = tempTokens.filter((token) => 
      token.symbol.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setTokensInfo(temp);
  };

  useEffect(() => {
    setBorderWidth(walletRef.current.clientWidth);
  }, [])

  const setETHTokensBalance = (text:any) => {
    let tempTokens: ERC20Token[] = [];
    const ethBalance = text.ETH.balance;
    const ethPrice = text.ETH.price.rate;
    const usdETHBalance = ethBalance * ethPrice;
    const ETHLINK = "https://etherscan.io/address/";
    let usdBalance = 0;
    tempTokens.push({
      name:network[0].data.chain?.id == 1 ? "ETH" : "BNB",
      symbol: network[0].data.chain?.id == 1 ? "ETH" : "BNB",
      contractAddress: address,
      price: ethPrice,
      balance: ethBalance,
      usdBalance: usdETHBalance,
      holdersCount: 0,
      image: "",
      network: constant.ETHEREUM_NETWORK,
      owner: address,
      totalSupply: 0,
      marketCap: "",
      contractPage: ETHLINK + address
    } as ERC20Token)

    usdBalance += usdETHBalance;
    const tokenCnt = Object.keys(text["tokens"]).length;
    if (tokenCnt != 0) {
      text.tokens.forEach((value: any) => {
        const tokenPrice = value.tokenInfo.price == false ? 0 : value.tokenInfo.price.rate;
        const decimal = parseInt(value.tokenInfo.decimals);
        const tokenBalance = decimal != 0 ? value.balance / Math.pow(10, decimal) : 0;
        const tokenUSDBalance = tokenBalance * tokenPrice;
        if (value.tokenInfo.address.toLocaleLowerCase() == tokenData.contractAddress.toLocaleLowerCase() && 
            value.tokenInfo.symbol.toLocaleLowerCase() == tokenData.symbol.toLocaleLowerCase()) {
              tokenData.balance = tokenBalance;
              tokenData.usdBalance = tokenUSDBalance;
              setTokenData(tokenData);
        }
        if (tokenPrice != 0){
          usdBalance += tokenUSDBalance;
        }
        tempTokens.push({
          name:value.tokenInfo.name,
          symbol: value.tokenInfo.symbol,
          contractAddress: value.tokenInfo.address,
          price: tokenPrice,
          balance: tokenBalance,
          usdBalance: tokenUSDBalance,
          decimals: decimal,
          holdersCount: value.tokenInfo.holdersCount,
          image: value.tokenInfo.image,
          owner: value.tokenInfo.owner,
          totalSupply: value.tokenInfo.totalSupply,
          marketCap: value.tokenInfo.totalSupply,
          contractPage: ETHLINK + value.tokenInfo.address
        } as ERC20Token)
      });
    }
    setTokensInfo(tempTokens);
    setInitTokensInfo(tempTokens);
    setWalletTokens(tempTokens);
    setWalletBalance(usdBalance);
  }

  const initAllInfos = () => {
    setInitTokensInfo([]);
    setTokensInfo([]);
    setWalletBalance(0);
    setWalletTokens([]);
  }
  const getTokensFromWallet = async() => {
    if (address == null || address == "")
      return;
      
    initAllInfos();
    if (network[0].data.chain?.id == 1) {
      const res = await getContractInfoFromWalletAddress(address!, constant.ETHEREUM_NETWORK);
      setETHTokensBalance(res);
    } else {
      let usdBalance = 0;
      const res = await getContractInfoFromWalletAddress(address!, constant.BINANCE_NETOWRK);
      if (res != constant.NOT_FOUND_TOKEN){
        res.forEach((value: ERC20Token) => {
          usdBalance += value.usdBalance;
          if (tokenData != undefined) {
          if (value.contractAddress.toLocaleLowerCase() == tokenData.contractAddress.toLocaleLowerCase() && 
              value.symbol.toLocaleLowerCase() == tokenData.symbol.toLocaleLowerCase()) { 
                  tokenData.balance = value.balance;
                  tokenData.usdBalance = value.usdBalance;
                  setTokenData(tokenData);
            }
          }
        });
        setTokensInfo(res);
        setInitTokensInfo(res);
        setWalletBalance(usdBalance);
        setWalletTokens(res);
      }
    }
  }

  useEffect(() => {
    initAllInfos();
    if (address != undefined) {
      getTokensFromWallet();
    }
  }, [address, network[0].data.chain?.id, tokenData]);
  return (
    <Box className={walletClass} ref = {walletRef}>
      <Box className={titleClass}>
        <Box style={{
          display:"flex", 
          width:"89%", 
          flexDirection:"row", 
          justifyContent:"space-between"
        }}>
          <Box className={style.walletBalance}>
            <p className={style.myWallet}> My Wallet: </p>
            <p className={style.myBalance} style={{color:priceColor}}> {convertBalanceCurrency(walletBalance)} </p>
          </Box>
          <Button
            border={'1px'}
            borderRadius={'2rem'}
            borderColor={refreshBtnBorderColor}
            backgroundColor={refreshBtnBgColor}
            onClick={getTokensFromWallet}
          >
            <Refresh/>
            <p style={{marginLeft:"5px", fontSize:"0.8rem"}}>Refresh</p>
          </Button>
        </Box>
      </Box>
      <nav><hr aria-orientation='horizontal' style={{width:borderWidth}}></hr></nav>
      <Box style={{
          display:"flex", 
          flexDirection:"row", 
          alignItems:"center",
          justifyContent:"center",
          width:"89%"
        }}
      >
        <Button
          style={{
            marginTop:"1rem",
            fontSize:"1rem",
            fontFamily:"Inter",
            fontWeight:"500",
            color:widgetOption == false ? widgetfontColor : "#FFFFFF"
          }}
          _hover={{
            backgroundColor:widgetOption == false ? notSelectBtnColor : selectBtnColor
          }}
          width={"50%"}
          borderRadius={"0.7rem 0rem 0rem 0.7rem"}
          height={"2.8rem"}
          backgroundColor={widgetOption == false ? notSelectBtnColor : selectBtnColor}
          onClick={()=>setWidgetOption(true)}
        >
          TRADE
        </Button>
        <Button
          style={{
            marginTop:"1rem",
            fontSize:"1rem",
            fontFamily:"Inter",
            fontWeight:"500",
            color:widgetOption == false ? "#FFFFFF" : widgetfontColor
          }}
          _hover={{
            backgroundColor:widgetOption == false ? selectBtnColor : notSelectBtnColor
          }}
          width={"50%"}
          height={"2.8rem"}
          borderRadius={"0rem 0.7rem 0.7rem 0rem"}
          backgroundColor={widgetOption == false ? selectBtnColor : notSelectBtnColor}
          color={"#FFFFFF"}
          onClick={()=>setWidgetOption(false)}
        >
          WALLET
        </Button>
      </Box>
      {
        widgetOption ?
        <Box 
          className={style.tradeWidget}
          // backgroundColor = {refreshBtnBgColor}
        > 
          {
            tokenData != undefined && tokenData.contractAddress != "" ?
            <SwapTrade></SwapTrade> :
            <></>
          }
          
        </Box> :
        <Box className={style.walletWidget}>
          <InputGroup className = {searchClass} width={"89%"}>
            <InputLeftElement
                paddingTop = '7px'
                paddingLeft= '5px'
                pointerEvents='none'
            >
              <SearchIcon/>
            </InputLeftElement>
            <Input 
              placeholder='Search token symbol' 
              _placeholder={{fontsize:'1rem', fontcolor:"#E34B62"}}
              onChange={handleSearchChange}
              borderRadius ={"2rem"}
              value={searchContext}
              height='2.5rem'
              background={searchColor}
              borderColor={searchBorderColor}
            />  
            {
              searchContext.length > 0 && 
              <InputRightElement
                onClick={()=>{
                  setSearchContext("");
                  setTokensInfo(initTokensInfo);
                }}
                cursor='pointer'
                paddingTop = '7px'
                paddingRight= '5px'
              >
                <SearchCross/>
              </InputRightElement>
            }
          </InputGroup>
          <Box 
            className={tableHeadBorder} 
            style = {{width:"100%", marginTop:"1rem"}}
            display = {"flex"}
            flexDirection = {"column"}
            alignItems = {"center"}
          >
            <Box 
              style={{width:"89%", maxHeight:"30rem", marginBottom:"0.5rem"}} 
              display={"flex"} 
              flexDirection={"row"}
              alignContent={"center"}
              color={"#7C7C7C"}
              paddingRight={"10px"}
            >
              <p style={{width:"30%"}}>Token</p>
              <p style={{width:"35%"}}>Balance</p>
              <p style={{width:"35%", alignItems:"flex-end", display:"flex", flexDirection:"column"}}>Value</p>
            </Box>  
            <Box style={{
                width:"100%", 
                height:"26rem", 
                alignItems:"center"
              }}
              display={"flex"}
              flexDirection={"column"}
              overflow={"auto"}
              css={{
                '&::-webkit-scrollbar': {
                  width: '10px',
                  height: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                  height: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: "#3D3D3D",
                  borderRadius: '24px',
                },
              }}
            >
            {
              tokensInfo?.map((token, index) => {
                if (Number.isNaN(token.decimals))
                  return ;              
                return (
                  <Box 
                    key = {index}
                    style={{
                      width:"100%",
                    }} 
                    display={"flex"} 
                    alignItems={"center"}
                    _hover={{
                      backgroundColor:hoverColor,
                      color: "#FFFFFF"
                    }}
                    paddingTop={"5px"}
                    paddingBottom={"5px"}
                    justifyContent={"center"}
                  >
                    <Box
                      style={{width:"89%"}} 
                      display={"flex"} 
                      flexDirection={"row"}
                    >
                      <Box
                        style={{width:"30%"}}
                        display={"flex"}
                        alignItems={"center"}
                        _hover={{
                          "textDecoration":"underline",
                        }}
                        cursor="pointer"
                      >
                        <a className={style.tokenName}
                          href={token.contractPage}
                          target="_blank" rel="noreferrer noopener"
                        >
                          {makeShortTokenName(token.symbol, 10)}
                        </a>
                      </Box>
                      <p className={style.tokenBalance} style={{width:"35%",marginRight:"5px", alignItems:"flex-start", paddingLeft:"2px"}}>
                        {makeShortTokenName(numberWithCommasTwoDecimals(token.balance), 25)}
                      </p>
                      <p className={style.tokenBalance} style={{width:"35%", color:priceColor, alignItems:"flex-end"}} >
                        ({makeShortTokenName(convertBalanceCurrency(token.usdBalance, 2), 20)})
                      </p>
                    </Box>
                  </Box>
                )
              })
            }
            </Box>
          </Box>
        </Box>
      }
      
      <nav><hr aria-orientation='horizontal' style={{width:borderWidth}}></hr></nav>
      <Box width={"100%"} height={"100%"} background={refreshBtnBgColor}>

      </Box>
    </Box>
  );
}