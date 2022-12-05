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
  calc
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
  numberWithCommasTwoDecimals
} from '../../utils'
import {Refresh} from '../../assests/icon'
import style from './WalletInfo.module.css'

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

  const tokenColor = useColorModeValue("#1C1C1C","#FFFFFF");
  const refreshBtnBgColor = useColorModeValue("#FFFFFF","#1C1C1C");
  const refreshBtnBorderColor = useColorModeValue("#CFCFCF","#5c5c5c");
  const tableBodyBorder = useColorModeValue(style.walletTokenBodyBorderLight,style.walletTokenBodyBorderDark);
  const tableHeadBorder = useColorModeValue(style.walletTokenHeadBorderLight,style.walletTokenHeadBorderDark);
  const address = useAddress();
  const network = useNetwork();
  
  const [searchContext, setSearchContext] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [tokensInfo, setTokensInfo] = useState<ERC20Token[]>([]);
  const [initTokensInfo, setInitTokensInfo] = useState<ERC20Token[]>([]);

  const handleSearchChange = (e: { target: { value: string; }; }) => {
    const { value } = e.target;
    setSearchContext(value);    
    let tempTokens = initTokensInfo;
    const temp = tempTokens.filter((token) => 
      token.symbol.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setTokensInfo(temp);
  };

  const setTokensBalance = (text:any) => {
    let tempTokens: ERC20Token[] = [];
    const ethBalance = text.ETH.balance;
    const ethPrice = text.ETH.price.rate;
    const usdBalance = ethBalance * ethPrice;
    setWalletBalance(usdBalance);
    const tokenCnt = Object.keys(text["tokens"]).length;
    if (tokenCnt != 0) {
      text.tokens.forEach((value: any) => {
        const tokenPrice = value.tokenInfo.price == false ? 0 : value.tokenInfo.price.rate;
        const decimal = parseInt(value.tokenInfo.decimals);
        const tokenBalance = decimal != 0 ? value.balance / Math.pow(10, decimal) : 0;
        tempTokens.push({
          name:value.tokenInfo.name,
          symbol: value.tokenInfo.symbol,
          contractAddress: value.tokenInfo.address,
          price: tokenPrice,
          balance: tokenBalance,
          usdBalance: tokenBalance * tokenPrice,
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
  }
  const getTokensFromWallet = async() => {
    const res = await getContractInfoFromWalletAddress(address!);
    setTokensBalance(res);
  }

  useEffect(() => {
    if (address) {
      getTokensFromWallet();
    }
  }, [address]);

  return (
    <Box className={walletClass}>
      <Box className={titleClass}>
        <Box style={{
          display:"flex", 
          width:"80%", 
          flexDirection:"row", 
          justifyContent:"space-between"
        }}>
          <Box className={style.walletBalance}>
            <p className={style.myWallet}> My Wallet: </p>
            <p className={style.myBalance}> {convertBalanceCurrency(walletBalance)} </p>
          </Box>
          <Button
            border={'1px'}
            borderRadius={'2rem'}
            borderColor={refreshBtnBorderColor}
            backgroundColor={refreshBtnBgColor}
            onClick={getTokensFromWallet}
          >
            <Refresh/>
            <p style={{marginLeft:"5px"}}>Refresh</p>
          </Button>
        </Box>
      </Box>
      <nav><hr aria-orientation='horizontal'></hr></nav>
      <Box className={style.walletData}>
        <Input 
          className = {searchClass} 
          placeholder='Search' 
          onChange={handleSearchChange}
          value={searchContext}
        />  
        <Box style={{width:"80%"}}>
          <Table>
            <Thead className={tableHeadBorder}>
              <Tr>
                <Th style={{width:"40%"}} color={"#7C7C7C"}>Token</Th>
                <Th color={"#7C7C7C"}>Balance</Th>
              </Tr>
            </Thead>
            <Tbody className={tableBodyBorder}>
              {
                tokensInfo?.map((token) => {
                  if (token.price == 0)
                    return ;
                  return (
                    <Tr key={token.name}>
                        <Th>
                          <p className={style.tokenName} style={{color:tokenColor}}>
                            {token.symbol}
                          </p>
                        </Th>
                        <Th>
                          <div className={style.tokenBalance}>
                            <p style={{marginRight:"5px", color:tokenColor}}>
                              {numberWithCommasTwoDecimals(token.balance)}
                            </p>
                            <p style={{color:"#00C514"}}>
                              ({convertBalanceCurrency(token.usdBalance)})
                            </p>
                          </div>
                        </Th>
                    </Tr>
                  )
                })
              }
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}