import React, {useEffect, useState} from 'react'
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
  TableContainer
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
  makeShortTokenName,
  numberWithCommasTwoDecimals
} from '../../utils'
import {Refresh} from '../../assests/icon'
import style from './WalletInfo.module.css'
import * as constant from '../../utils/constant'
import { 
  useLPTokenPrice,
  useTokenInfo,
  useWalletTokenBalance 
} from '../../hooks'

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
  const selectBtnColor ="#0067C6";// useColorModeValue("#0070D7","#494949");
  const notSelectBtnColor = useColorModeValue("#E0E0E0","#1C1C1C");
  const tokenColor = useColorModeValue("#1C1C1C","#FFFFFF");
  const refreshBtnBgColor = useColorModeValue("#FFFFFF","#1C1C1C");
  const refreshBtnBorderColor = useColorModeValue("#CFCFCF","#5c5c5c");
  const headerColor = useColorModeValue("#FFFFFF", "#262626");
  const priceColor = useColorModeValue("#00B112","#00C514");
  const tableBodyBorder = useColorModeValue(style.walletTokenBodyBorderLight,style.walletTokenBodyBorderDark);
  const tableHeadBorder = useColorModeValue(style.walletTokenHeadBorderLight,style.walletTokenHeadBorderDark);
  const address = useAddress();
  const network = useNetwork();
  
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

  const setETHTokensBalance = (text:any) => {
    let tempTokens: ERC20Token[] = [];
    const ethBalance = text.ETH.balance;
    const ethPrice = text.ETH.price.rate;
    const usdETHBalance = ethBalance * ethPrice;
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
      marketCap: ""
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
          marketCap: value.tokenInfo.totalSupply
        } as ERC20Token)
      });
    }
    setTokensInfo(tempTokens);
    setInitTokensInfo(tempTokens);
    setWalletTokens(tempTokens);
    setWalletBalance(usdBalance);
  }

  const getTokensFromWallet = async() => {
    if (network[0].data.chain?.id == 1) {
      const res = await getContractInfoFromWalletAddress(address!, constant.ETHEREUM_NETWORK);
      setETHTokensBalance(res);
    } else {
      let usdBalance = 0;
      const res = await getContractInfoFromWalletAddress(address!, constant.BINANCE_NETOWRK);
      if (res != constant.NOT_FOUND_TOKEN){
        res.forEach((value: ERC20Token) => {
          usdBalance += value.usdBalance;
          if (value.contractAddress.toLocaleLowerCase() == tokenData.contractAddress.toLocaleLowerCase() && 
              value.symbol.toLocaleLowerCase() == tokenData.symbol.toLocaleLowerCase()) { 
                  tokenData.balance = value.balance;
                  tokenData.usdBalance = value.usdBalance;
                  setTokenData(tokenData);
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
    setInitTokensInfo([]);
    setTokensInfo([]);
    setWalletBalance(0);
    if (address != undefined) {
      getTokensFromWallet();
    }
  }, [address, network[0].data.chain?.id]);

  return (
    <Box className={walletClass}>
      <Box className={titleClass}>
        <Box style={{
          display:"flex", 
          width:"78%", 
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
      <nav><hr aria-orientation='horizontal'></hr></nav>
      <Box style={{
          display:"flex", 
          flexDirection:"row", 
          alignItems:"center",
          justifyContent:"center"
        }}
      >
        <Button
          style={{
            marginTop:"1rem",
            fontSize:"1rem",
            fontFamily:"Inter",
            fontWeight:"500"
          }}
          _hover={{
            backgroundColor:notSelectBtnColor
          }}
          width={"39%"}
          borderRadius={"0.7rem 0rem 0rem 0.7rem"}
          height={"2.8rem"}
          backgroundColor={notSelectBtnColor}
        >
          TRADE
        </Button>
        <Button
          style={{
            marginTop:"1rem",
            fontSize:"1rem",
            fontFamily:"Inter",
            fontWeight:"500"
          }}
          _hover={{
            backgroundColor:selectBtnColor
          }}
          width={"39%"}
          height={"2.8rem"}
          borderRadius={"0rem 0.7rem 0.7rem 0rem"}
          backgroundColor={selectBtnColor}
          color={"#FFFFFF"}
        >
          WALLET
        </Button>
      </Box>
      <Box className={style.walletData}>
        <Input 
          className = {searchClass} 
          placeholder='Search' 
          fontSize='0.8rem'
          onChange={handleSearchChange}
          value={searchContext}
          height='2.5rem'
        />  
        <Box style={{width:"78%", maxHeight:"30rem"}}>
          <TableContainer overflowY={"auto"} overflowX={"auto"} height={"100%"} css={{
              '&::-webkit-scrollbar': {
                width: '10px',
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
                height: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: "grey",
                borderRadius: '24px',
              },
            }}>
            <Table style={{height:"5rem"}} >
              <Thead
               className={tableHeadBorder} 
               position="sticky" 
               top={0} 
               zIndex="docked"
               backgroundColor={headerColor}
              >
                <Tr>
                  <Th style={{width:"40%", paddingBottom:"0rem", paddingLeft:"0rem"}} textTransform={"initial"} color={"#7C7C7C"}>Token</Th>
                  <Th style={{paddingBottom:"0rem", paddingLeft:"0rem"}} textTransform={"initial"} color={"#7C7C7C"}>Balance</Th>
                </Tr>
              </Thead>
              <Tbody className={tableBodyBorder}>
                {
                  tokensInfo?.map((token, index) => {
                    if (Number.isNaN(token.decimals))
                      return ;
                    return (
                      <Tr key={token.name + index}>
                          <Th style={{padding:"0.3rem 0.5rem 0.3rem 0rem"}}>
                            <p className={style.tokenName} style={{color:tokenColor}}>
                              {makeShortTokenName(token.symbol, 13)}
                            </p>
                          </Th>
                          <Th style={{padding:"0.3rem 0rem 0.3rem 0rem"}}>
                            <div className={style.tokenBalance}>
                              <p style={{marginRight:"5px", color:tokenColor}}>
                                {numberWithCommasTwoDecimals(token.balance)}
                              </p>
                              <p style={{color:priceColor}}>
                                {convertBalanceCurrency(token.usdBalance)}
                              </p>
                            </div>
                          </Th>
                      </Tr>
                    )
                  })
                }
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}