import React, { useContext, useEffect, useState } from "react";
import { BigNumber, Contract, ethers, utils } from "ethers";
import { AbiItem } from 'web3-utils'
import Web3 from "web3";
import { useLPTokenPrice } from "./useLPTokenPrice";
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import * as constant from '../utils/constant'
import { getLastTransactionsLogsByTopic } from "../api";
import { getLimitHistoryData } from "../api/bitquery_graphql";
import { TransactionType } from "../utils/type";
import { appendPastTransactions } from "../components/TokenTransaction/module";

interface LPTransactionInterface {
  transactionData: TransactionType[];
  setTransactionData: (txData: TransactionType[]) => void;
}

const LPTransactionContext: React.Context<null | LPTransactionInterface> =
  React.createContext<null | LPTransactionInterface>(null);

export function LPTransactionProvider({children}:any) {

  const [transactionList, setTransactionList] = useState<TransactionType[]>([]);
  const [tempTransactionList, setTempTransactionList] = useState<TransactionType[]>([]);
  const {lpTokenAddress} = useLPTokenPrice();
  let web3Wss: any, web3Http: any, PairContractWSS:Contract, PairContractHttp:Contract;

  useEffect(() => {
    if (tempTransactionList.length > 0) {
      const temp = [...transactionList];
      temp.unshift(...tempTransactionList);
      setTransactionList(temp);
      setTempTransactionList([]);
    }
  }, [transactionList, tempTransactionList]);

  useEffect(() => {

    const init = async() => {
      
      const tempTransaction = await appendPastTransactions(transactionList, lpTokenAddress, true);
      setTransactionList(tempTransaction);

      if (lpTokenAddress.network == constant.ETHEREUM_NETWORK) {
        web3Wss = new ethers.providers.WebSocketProvider(constant.WSSETHRPC_URL);
        PairContractWSS = new ethers.Contract(lpTokenAddress.contractAddress, UniswapV2Pair, web3Wss); 
        web3Http = new Web3(constant.ETHRPC_URL);
        PairContractHttp = new web3Http.eth.Contract(
          UniswapV2Pair as AbiItem[],
          lpTokenAddress.contractAddress
        );   
      } else {
        web3Wss = new ethers.providers.WebSocketProvider(constant.WSSBSCRPC_URL);
        PairContractWSS = new ethers.Contract(lpTokenAddress.contractAddress, PancakeswapV2Pair, web3Wss);
        web3Http = new Web3(constant.BSCRPC_URL);
        PairContractHttp = new web3Http.eth.Contract(
          PancakeswapV2Pair as AbiItem[],
          lpTokenAddress.contractAddress
        );
      }
      

      console.log('seted transactionList', transactionList);

      const filterSync = PairContractWSS.filters.Swap()
      const event = PairContractWSS.on(filterSync, async(sender, amount0In, 
        amount1In, amount0Out, amount1Out, to, event) => {
          const date = new Date().toISOString();
          const buy = lpTokenAddress.network == constant.BINANCE_NETOWRK ? 
            amount0In == 0 && amount1Out == 0 ? "Buy" :"Sell":
            amount1In == 0 && amount0Out == 0 ? "Buy" : "Sell";
          
          const baseAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount1In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount0In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) :
            buy == "Buy" ? amount1Out /  Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount1In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) ;
          const quoteAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount0Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount1Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) :
            buy == "Buy" ? amount0In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount0Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!);

          const item = {
            buy_sell: buy,
            baseToken_amount: baseAmount,
            quoteToken_amount: quoteAmount,
            quoteToken_symbol: lpTokenAddress.quoteCurrency_name,
            transaction_hash: event.transactionHash,
            transaction_local_time: date.replace('T', ' ').slice(0, 19),
            transaction_utc_time: date
          } as TransactionType;
          console.log('new item', item);
          setTempTransactionList([item]);
      });

    }

    if (lpTokenAddress.ownerToken !=undefined && lpTokenAddress.ownerToken != "") {
      init();
    }

    return(() => {

      if (PairContractWSS) {
        PairContractWSS.removeAllListeners();
      }
    })

  },[lpTokenAddress.contractAddress])
  return(
    <LPTransactionContext.Provider
      value={{
        transactionData:transactionList,
        setTransactionData: setTransactionList,
      }}
      >
        {children}
      </LPTransactionContext.Provider>
  );
}

export function useLPTransaction() {
  const context = useContext(LPTransactionContext);
  if (!context) {
    throw new Error("Missing LP Transaction context");
  }

  return context;
}
