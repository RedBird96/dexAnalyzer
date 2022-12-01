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
  useColorMode
} from "@chakra-ui/react"
import {Refresh} from '../../assests/icon'
import style from './WalletInfo.module.css'

export default function WalletInfo() {
  const { colorMode } = useColorMode()
  const dark = style.walletInfo + " " + style.walletInfoDark;
  const light = style.walletInfo + " " + style.walletInfoLight;

  const titleDark = style.walletTitle + " " + style.walletTitleDark;
  const titleLight = style.walletTitle + " " + style.walletTitleLight;

  return (
    <Box className={colorMode == "light" ? light : dark}>
      <Box className={colorMode == "light" ? titleLight : titleDark}>
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
      <Box className={style.walletData}>
        <Input className = {style.tokenSearch} placeholder='Search' />  
        <Box>
          <Table size='md' border={"hidden"}>
            <Thead border={"hidden"} color={"#969696"}>
              <Tr>
                <Th>Token</Th>
                <Th>Balance</Th>
              </Tr>
            </Thead>
            <Tbody border={"hidden"} color={"#969696"}>
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