import React from 'react'
import { 
  Box, 
  Button, 
  Input,
  Table,
  Thead,
  Tr,
  Th,
  Tbody
} from "@chakra-ui/react"
import style from './WalletInfo.module.css'

export default function WalletInfo() {
  return (
    <Box className={style.walletInfo}>
      <Box className={style.walletTitle}>
        <Box className={style.walletBalance}>
          <p> My Wallet: </p>
          <p> $765,825 </p>
        </Box>
        <Button
          border={'1px'}
          borderColor={'blackAlpha.300'}
        >
          Refresh
        </Button>
      </Box>
      <Box className={style.walletData}>
        <Input className = {style.tokenSearch} placeholder='Search' />  
        <Box>
          <Table>
            <Thead>
              <Tr>
                <Th>Token</Th>
                <Th>Balance</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Th>DOGE</Th>
                <Th>59,034,513,124 ($765,825)</Th>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}