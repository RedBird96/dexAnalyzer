import React, {useEffect, useRef, useState} from 'react'
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
import { useLPTokenPrice, useLPTransaction, useTokenInfo } from '../../hooks'
import style from './TokenTransaction.module.css'
import { convertBalanceCurrency, makeShortTxHash, numberWithCommasTwoDecimals } from '../../utils'
import { useStableCoinPrice } from '../../hooks/useStableCoinPrice'
import * as constant from '../../utils/constant'
import { TokenSide, TransactionType } from '../../utils/type'
import { appendPastTransactions } from './module'

export default function TokenTransaction() {
  const transactionClass = useColorModeValue(
    style.tokenTransaction + " " + style.tokenTransactionLight,
    style.tokenTransaction + " " + style.tokenTransactionDark
  );
  const headerColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const {transactionData, setTransactionData} = useLPTransaction();
  const {lpTokenAddress} = useLPTokenPrice();
  const {tokenData} = useTokenInfo();
  const {coinPrice} = useStableCoinPrice();
  const [quotePrice, setquotePrice] = useState(1);
  const [bottomHandle, setBottomHandle] = useState<Boolean>(false);
  const [txTransaction, setTXTransaction] = useState<TransactionType[]>([]);
  const LINK_BSCNETWORK = "https://bscscan.com/tx/";
  const LINK_ETHNETWORK = "https://etherscan.io/tx/";
  const listInnerRef = useRef();

  // useEffect(() => {
  //   const init = async () => {
  //   const bar_data = await getlimitHistoryData(
  //     lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token1_contractAddress : lpTokenAddress.token0_contractAddress, 
  //     lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token0_contractAddress : lpTokenAddress.token1_contractAddress, 
  //     lpTokenAddress.network,
  //     after,
  //     before,
  //     1
  //   );
  //   }
  //   init();
  // }, [lpTokenAddress.contractAddress])

  const handleScroll = async (e:any) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= (e.target.clientHeight + 20);
    if (bottom && !bottomHandle) { 
      setBottomHandle(true);
      const tempTransaction = await appendPastTransactions(transactionData, lpTokenAddress, false);
      let transaction = transactionData;
      transaction = transaction.concat(tempTransaction);
      console.log('bottom', transaction.length);
      setTransactionData(transaction);
      setBottomHandle(false);
    }
  }

  useEffect(() => {
    const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
    lpTokenAddress.quoteCurrency_contractAddress! + lpTokenAddress.network);
    if (coin != undefined)
      setquotePrice(coin.price);
    console.log('updated data', transactionData);
    setTXTransaction(transactionData);
  }, [transactionData])
  useEffect(() => {
    setTXTransaction([]);
    setquotePrice(1);
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
        }}
        onScroll={handleScroll}
      >
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
            txTransaction.map((data, index) => {
              if (data != null) {
                const buy_sell = data.buy_sell;
                const color = buy_sell == "Buy" ? "#00C414": "#FF002E";               
                const usdVal = quotePrice * data.quoteToken_amount;
                const txHash = data.transaction_hash;
                const currentTime = new Date(data.transaction_utc_time);
                const linkAddr = tokenData.network == constant.BINANCE_NETOWRK ? LINK_BSCNETWORK + txHash: LINK_ETHNETWORK + txHash;
                return (
                <Tr key={index} color={color} className={style.txData}>
                  <Td width={"8%"} paddingLeft={"1.5rem"}>{buy_sell}</Td>
                  <Td width={"24%"} paddingLeft={"0.7rem"}>{numberWithCommasTwoDecimals(data.baseToken_amount)}</Td>
                  <Td width={"32%"} paddingLeft={"2rem"}>
                    {convertBalanceCurrency(usdVal) + " (" + 
                    numberWithCommasTwoDecimals(data.quoteToken_amount) + " " +
                    lpTokenAddress.quoteCurrency_name! + ")"}
                  </Td>
                  <Td width={"24%"} paddingLeft={"3rem"}>{data.transaction_local_time}</Td>
                  <Td width={"16%"} paddingLeft={"0rem"}>
                    <Box
                     _hover={{"textDecoration":"underline"}}
                     cursor="pointer"
                    >
                      <a href={linkAddr}>
                        {makeShortTxHash(txHash)}
                      </a>
                    </Box>
                  </Td>
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