import React from 'react'
import { 
  Box, 
  Button, 
  Input,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  useColorModeValue
} from "@chakra-ui/react"
import {
  useNetwork,
  useAddress,
} from '@thirdweb-dev/react'
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
  
  if (address) {
    console.log('Address',address, network);
  }
  
  return (
    <Box className={walletClass}>
      <Box className={titleClass}>
        <Box className={style.walletBalance}>
          <p className={style.myWallet}> My Wallet: </p>
          <p className={style.myBalance}> $765,825 </p>
        </Box>
        <Button
          border={'1px'}
          borderRadius={'25px'}
          borderColor={refreshBtnBorderColor}
          backgroundColor={refreshBtnBgColor}
        >
          <Refresh/>
          <p style={{marginLeft:"5px"}}>Refresh</p>
        </Button>
      </Box>
      <nav><hr aria-orientation='horizontal'></hr></nav>
      <Box className={style.walletData}>
        <Input className = {searchClass} placeholder='Search' />  
        <Box style={{width:"80%"}}>
          <Table>
            <Thead className={tableHeadBorder}>
              <Tr>
                <Th style={{width:"40%"}} color={"#7C7C7C"}>Token</Th>
                <Th color={"#7C7C7C"}>Balance</Th>
              </Tr>
            </Thead>
            <Tbody className={tableBodyBorder}>
            <Tr>
                <Th>
                  <p className={style.tokenName} style={{color:tokenColor}}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px", color:tokenColor}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName} style={{color:tokenColor}}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px", color:tokenColor}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName} style={{color:tokenColor}}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px", color:tokenColor}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName} style={{color:tokenColor}}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px", color:tokenColor}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName} style={{color:tokenColor}}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px", color:tokenColor}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}