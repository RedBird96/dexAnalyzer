import React from 'react'
import { Box, useColorModeValue } from "@chakra-ui/react"
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
  const transactionClass = useColorModeValue(
    style.tokenTransaction + " " + style.tokenTransactionLight,
    style.tokenTransaction + " " + style.tokenTransactionDark
  );
  const headerColor = useColorModeValue("#FFFFFF", "#1C1C1C");

  return (
    <Box className={transactionClass}>
      <TableContainer overflowY={"auto"} overflowX={"auto"} height={"100%"} css={{
        '&::-webkit-scrollbar': {
          width: '4px',
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
        <Table variant='striped' colorScheme='transactionTable' size={"sm"}>
        <Thead position="sticky" top={0} zIndex="docked" backgroundColor={headerColor}>
          <Tr>
            <Th color={"#7C7C7C"} width={"5%"} textTransform={"initial"}>Activity</Th>
            <Th color={"#7C7C7C"} width={"30%"} textTransform={"initial"}>Tokens</Th>
            <Th color={"#7C7C7C"} width={"40%"} textTransform={"initial"}>Amount</Th>
            <Th color={"#7C7C7C"} width={"20%"} textTransform={"initial"}>Date</Th>
            <Th color={"#7C7C7C"} width={"5%"} textTransform={"initial"}>Txn</Th>
          </Tr>
        </Thead>
        <Tbody className={style.tbody}>
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>      
          <Tr color={"#FF002E"}>
            <Td>Sell</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>          
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>        
          <Tr color={"#FF002E"}>
            <Td>Sell</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>        
          <Tr color={"#FF002E"}>
            <Td>Sell</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>           
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>               
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#FF002E"}>
            <Td>Sell</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#00C414"}>
            <Td>Buy</Td>
            <Td>59,034,543,124,564,247</Td>
            <Td>$ 50.30 (0.2 BNB)</Td>
            <Td>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#00C414"}>
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