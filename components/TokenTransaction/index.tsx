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
  
  TableContainer,
} from '@chakra-ui/react'
import { useLPTokenPrice, useLPTransaction, useTokenInfo } from '../../hooks'
import style from './TokenTransaction.module.css'
import { convertBalanceCurrency, makeShortTxHash, numberWithCommasNoDecimals, numberWithCommasTwoDecimals } from '../../utils'
import { useStableCoinPrice } from '../../hooks/useStableCoinPrice'
import * as constant from '../../utils/constant'
import { TokenSide, TransactionType } from '../../utils/type'
import { appendPastTransactions } from './module'
import useSize from '../../hooks/useSize'
import { SCREENMD_SIZE, SCREENNXL_SIZE } from '../../utils/constant'


export default function TokenTransaction() {
  const transactionClass = useColorModeValue(
    style.tokenTransaction,
    style.tokenTransaction
  );
  const headerColor = useColorModeValue("#FFFFFF", "#17212B");
  const priceColor = useColorModeValue("#00B112","#00C514");
  const {transactionData, setTransactionData} = useLPTransaction();
  const {lpTokenAddress} = useLPTokenPrice();
  const {tokenData} = useTokenInfo();
  const {coinPrice} = useStableCoinPrice();
  const [quotePrice, setquotePrice] = useState(1);
  const [bottomHandle, setBottomHandle] = useState<Boolean>(false);
  const [txTransaction, setTXTransaction] = useState<TransactionType[]>(transactionData);
  const infoborderColorMode = useColorModeValue("#E2E8F0","#505050");
  const LINK_BSCNETWORK = "https://bscscan.com/tx/";
  const LINK_ETHNETWORK = "https://etherscan.io/tx/";
  const windowDimensions = useSize();
  const handleScroll = async (e:any) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= (e.target.clientHeight + 20);
    if (bottom && !bottomHandle) { 
      setBottomHandle(true);
      const tempTransaction = await appendPastTransactions(transactionData, lpTokenAddress, false, tokenData);
      let transaction = transactionData;
      transaction = transaction.concat(tempTransaction);
      setTransactionData(transaction);
      setBottomHandle(false);
    }
  }

  useEffect(() => {
    if (lpTokenAddress.contractAddress.length > 0 && 
        lpTokenAddress.quoteCurrency_contractAddress != undefined && 
        lpTokenAddress.quoteCurrency_contractAddress.length > 0
    ) {
      const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
      lpTokenAddress.quoteCurrency_contractAddress!.toLowerCase() + lpTokenAddress.network);
      if (coin != undefined)
        setquotePrice(coin.price);
      setTXTransaction(transactionData);
    }
  }, [transactionData])
  
  useEffect(() => {
    setTXTransaction([]);
    setquotePrice(1);
  }, [lpTokenAddress.contractAddress])

  return (
    <Box className={transactionClass} width = {"100%"}>
      <TableContainer overflowY={"auto"} overflowX={"auto"} height={"100%"} css={{
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '4px',
        },
        '&::-webkit-scrollbar-track': {
          marginTop: '30px',
          width: '6px',
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '24px',
        },
        }}
        onScroll={handleScroll}
      >
        <Table variant='striped' colorScheme='navy' size={"sm"}>
        <Thead position="sticky" top={0} zIndex="docked" backgroundColor={headerColor}>
          <Tr>
            <Th fontWeight={"medium"} color={"#7C7C7C"} width={"8%"} textTransform={"initial"} paddingLeft={"2rem"} fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.6rem"}>Activity</Th>
            <Th fontWeight={"medium"} color={"#7C7C7C"} width={"18%"} textTransform={"initial"} paddingLeft={"0.7rem"} fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.6rem"}>Tokens</Th>
            <Th fontWeight={"medium"} color={"#7C7C7C"} width={"42%"} textTransform={"initial"} paddingLeft={"10rem"} fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.6rem"}>Amount</Th>
            <Th fontWeight={"medium"} color={"#7C7C7C"} width={"24%"} textTransform={"initial"} paddingLeft={"3rem"} fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.6rem"}>Date</Th>
            <Th fontWeight={"medium"} color={"#7C7C7C"} width={"16%"} textTransform={"initial"} paddingLeft={"0rem"} fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.6rem"}>Txn</Th>
          </Tr>
        </Thead>
        <Tbody className={style.tbody} style={{overflow:"auto"}}>
          {
            txTransaction.map((data, index) => {
              if (data != null) {
                const buy_sell = data.buy_sell;
                const color = buy_sell == "Buy" ? priceColor: "#DC3545";        
                const boxColor = buy_sell == "Buy" ? "#01840E" : "#DC3545";
                const usdVal = quotePrice * data.quoteToken_amount;
                const txHash = data.transaction_hash;
                const linkAddr = tokenData.network == constant.BINANCE_NETOWRK ? LINK_BSCNETWORK + txHash: LINK_ETHNETWORK + txHash;
                const date = new Date(data.transaction_local_time + " UTC");

                return (
                <Tr key={index} color={color} className={style.txData}>
                  <Td width={"8%"} paddingLeft={"1.5rem"} paddingTop={"0rem"} paddingBottom={"0rem"}>
                    <Box
                      background={boxColor}
                      width={"50px"}
                      height={windowDimensions.width > SCREENNXL_SIZE ? "24px" : "22px"}
                      display = {"flex"}
                      borderRadius = {"5px"}
                      color={"white"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.7rem"}
                    >
                      <p>{buy_sell}</p>
                    </Box>
                  </Td>
                  <Td 
                    width={"18%"} 
                    paddingLeft={"0.7rem"} 
                    paddingTop={"0rem"} 
                    paddingBottom={"0rem"}
                    fontWeight='medium'
                    fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.7rem"}
                  >
                    {data.baseToken_amount < 1 ? numberWithCommasTwoDecimals(data.baseToken_amount, 4) : numberWithCommasNoDecimals(data.baseToken_amount)}
                  </Td>
                  <Td
                    width={"42%"} 
                    paddingLeft={"2rem"}
                    paddingTop={"0rem"} 
                    paddingBottom={"0rem"}
                    fontWeight='medium'
                    style={{
                    paddingLeft:"0rem"
                  }}>
                    <Box style={{
                    display:"flex",
                    flexDirection:"row",
                    width:"100%"
                    }}
                    fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.7rem"}
                    >
                    <p style={{
                      width:"12rem",
                      textAlign:"right"
                    }}>{convertBalanceCurrency(usdVal, 2)}</p>
                    <div className={style.border} style={{borderColor:infoborderColorMode}}/>
                    <p style={{
                      width:"80%",
                      textAlign:"left"
                    }}>{numberWithCommasTwoDecimals(data.quoteToken_amount) + " " + lpTokenAddress.quoteCurrency_name}</p>
                    </Box>
                  </Td>
                  <Td 
                    width={"24%"} 
                    paddingLeft={"3rem"} 
                    paddingTop={"0rem"} 
                    paddingBottom={"0rem"}
                    fontWeight='medium'
                    fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.7rem"}
                  >
                      {date.toLocaleString("en-US")}
                  </Td>
                  <Td 
                    width={"16%"} 
                    paddingTop={"0rem"} 
                    paddingBottom={"0rem"}
                    paddingLeft={"0rem"}
                    fontWeight='medium'
                  >
                    <Box
                     _hover={{"textDecoration":"underline"}}
                     cursor="pointer"
                     fontSize={windowDimensions.width > SCREENNXL_SIZE ? "0.8rem" : "0.7rem"}
                    >
                      <a href={linkAddr} target="_blank" rel="noreferrer noopener">
                        {makeShortTxHash(txHash)}
                      </a>
                    </Box>
                  </Td>
                </Tr>
                );
              }
            })
          }
        </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}