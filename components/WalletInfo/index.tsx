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

  return (
    <Box className={walletClass}>
      <Box className={titleClass}>
        <Box className={style.walletBalance}>
          <p className={style.myWallet}> My Wallet: </p>
          <p className={style.myBalance}> $765,825 </p>
        </Box>
        <Button
          border={'1px'}
          borderColor={'blackAlpha.300'}
          borderRadius={'25px'}
        >
          <Refresh/>
          <p style={{marginLeft:"5px"}}>Refresh</p>
        </Button>
      </Box>
      <nav><hr aria-orientation='horizontal'></hr></nav>
      <Box className={style.walletData}>
        <Input className = {searchClass} placeholder='Search' />  
        <Box style={{width:"80%"}}>
          <Table className={style.tableHead}>
            <Thead >
              <Tr>
                <Th style={{width:"40%"}}>Token</Th>
                <Th>Balance</Th>
              </Tr>
            </Thead>
            <Tbody className={style.tableHead}>
              <Tr>
                <Th>
                  <p className={style.tokenName}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px"}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px"}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px"}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px"}}>59,034,513,124</p>
                    <p style={{color:"#00C514"}}>($765,825)</p>
                  </div>
                </Th>
              </Tr>
              <Tr>
                <Th>
                  <p className={style.tokenName}>DOGE</p>
                </Th>
                <Th>
                  <div className={style.tokenBalance}>
                    <p style={{marginRight:"5px"}}>59,034,513,124</p>
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