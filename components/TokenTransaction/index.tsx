import React, {useEffect, useState} from 'react'
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
import { useLPTokenPrice, useLPTransaction } from '../../hooks'
import style from './TokenTransaction.module.css'
import { makeShortTxHash } from '../../utils'

export default function TokenTransaction() {
  const transactionClass = useColorModeValue(
    style.tokenTransaction + " " + style.tokenTransactionLight,
    style.tokenTransaction + " " + style.tokenTransactionDark
  );
  const headerColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const {transactionData} = useLPTransaction();
  const {lpTokenAddress} = useLPTokenPrice();
  const [txTransaction, setTXTransaction] = useState<any[]>([]);

  useEffect(() => {
    setTXTransaction(transactionData);
  }, [transactionData])
  useEffect(() => {
    setTXTransaction([]);
  }, [lpTokenAddress.contractAddress])
  return (
    <Box className={transactionClass}>
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
        <Table variant='striped' colorScheme='transactionTable' size={"sm"}>
        <Thead position="sticky" top={0} zIndex="docked" backgroundColor={headerColor}>
          <Tr>
            <Th color={"#7C7C7C"} width={"8%"} textTransform={"initial"} paddingLeft={"1.5rem"}>Activity</Th>
            <Th color={"#7C7C7C"} width={"24%"} textTransform={"initial"} paddingLeft={"0.7rem"}>Tokens</Th>
            <Th color={"#7C7C7C"} width={"32%"} textTransform={"initial"} paddingLeft={"2rem"}>Amount</Th>
            <Th color={"#7C7C7C"} width={"24%"} textTransform={"initial"} paddingLeft={"3rem"}>Date</Th>
            <Th color={"#7C7C7C"} width={"16%"} textTransform={"initial"} paddingLeft={"0rem"}>Txn</Th>
          </Tr>
        </Thead>
        <Tbody className={style.tbody}>
          {
            txTransaction.map(data => {
              if (data != null) {
                const buy_sell = data.buyCurrency.address == data.quoteCurrency.address ? "Buy" : "Sell"; 
                const color = buy_sell == "Buy" ? "#00C414": "#FF002E";
                return (
                <Tr key={data.any + data.baseAmount} color={color}>
                  <Td width={"8%"} paddingLeft={"1.5rem"}>{buy_sell}</Td>
                  <Td width={"24%"} paddingLeft={"0.7rem"}>{data.baseAmount}</Td>
                  <Td width={"32%"} paddingLeft={"2rem"}>{data.quoteAmount}</Td>
                  <Td width={"24%"} paddingLeft={"3rem"}>{data.timeInterval.second}</Td>
                  <Td width={"16%"} paddingLeft={"0rem"}>{makeShortTxHash(data.any)}</Td>
                </Tr>
                );
              }
            })
          }
          {/* <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>      
          <Tr color={"#FF002E"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Sell</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>          
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>        
          <Tr color={"#FF002E"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Sell</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>        
          <Tr color={"#FF002E"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Sell</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>           
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>               
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#FF002E"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Sell</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>            
          <Tr color={"#00C414"}>
            <Td width={"8%"} paddingLeft={"1.5rem"}>Buy</Td>
            <Td width={"24%"} paddingLeft={"0.7rem"}>59,034,543,124,564,247</Td>
            <Td width={"32%"} paddingLeft={"2rem"}>$ 50.30 (0.2 BNB)</Td>
            <Td width={"24%"} paddingLeft={"3rem"}>Dec-01-2022 (04:35:49 PM + UTC)</Td>
            <Td width={"16%"} paddingLeft={"0rem"}>0xe2.....6f8</Td>
          </Tr>            */}
        </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}