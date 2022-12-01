import React from 'react'
import { Box, useColorMode } from "@chakra-ui/react"
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
import style from './TokenTransaction.module.css'

export default function TokenTransaction() {
  const { colorMode } = useColorMode()
  const dark = style.tokenTransaction + " " + style.tokenTransactionDark;
  const light = style.tokenTransaction + " " + style.tokenTransactionLight;

  return (
    <Box className={colorMode == "light" ? light : dark}>
      <TableContainer overflowY={"auto"} css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: "grey",
          borderRadius: '24px',
        },
      }}>
        <Table>
        <TableCaption>Transaction History</TableCaption>
        <Thead color={"#7C7C7C"}>
          <Tr>
            <Th>Activity</Th>
            <Th>Tokens</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th>Txn</Th>
          </Tr>
        </Thead>
        <Tbody color={"#00C414"}>
          <Tr>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>
          <Tr>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>
          <Tr>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>      
          <Tr>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>                  
        </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}