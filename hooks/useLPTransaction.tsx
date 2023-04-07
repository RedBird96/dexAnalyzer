import React, { useContext, useEffect, useMemo, useState } from "react";
import { Contract, ethers } from "ethers";
import { useLPTokenPrice } from "./useLPTokenPrice";
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import SRGToken from '../config/SRGToken.json';
import * as constant from '../utils/constant'
import { TokenSide, TransactionType } from "../utils/type";
import { appendPastTransactions } from "../components/TokenTransaction/module";
import { useTokenInfo } from "./useTokenInfo";
import { getCurrentBlockNumber, getSRGBuySellTransactions } from "../api";
import { RECONNECT_WEBSOCKET } from "../utils/constant";

interface LPTransactionInterface {
  transactionData: TransactionType[];
  setTransactionData: (txData: TransactionType[]) => void;
}

const LPTransactionContext: React.Context<null | LPTransactionInterface> =
  React.createContext<null | LPTransactionInterface>(null);

let subscription:any;
let subscriptionBuy: any;
let subscriptionSell:any;

export function LPTransactionProvider({children}:any) {

  const [transactionList, setTransactionList] = useState<TransactionType[]>([]);
  const [tempTransactionList, setTempTransactionList] = useState<TransactionType[]>([]);
  const {lpTokenAddress} = useLPTokenPrice();
  const {tokenData} = useTokenInfo();
  let PairContractWSS:Contract;


  const init = async() => {

    const tempTransaction = await appendPastTransactions(transactionList, lpTokenAddress, true, tokenData);
    setTransactionList(tempTransaction);

    if (lpTokenAddress.network == constant.ETHEREUM_NETWORK) {
      const webWss = new ethers.providers.WebSocketProvider("wss://mainnet.infura.io/ws/v3/e0e919cefdf04a40875a387f51d64516");
      PairContractWSS = new ethers.Contract(lpTokenAddress.contractAddress, UniswapV2Pair, webWss); 
    } else {
      const webWss = new ethers.providers.WebSocketProvider("wss://bsc-mainnet.nodereal.io/ws/v1/62368f2c5ac94dc59139d5b255ba1adb");
      PairContractWSS = new ethers.Contract(lpTokenAddress.contractAddress, PancakeswapV2Pair, webWss);
    }

    const filterSync = PairContractWSS.filters.Swap()
    const event = PairContractWSS.on(filterSync, async(sender, amount0In, 
      amount1In, amount0Out, amount1Out, to, event) => {
        
        if (tokenData == undefined || tokenData.contractAddress == "" || tokenData.contractAddress.toLowerCase() != lpTokenAddress.ownerToken.toLowerCase())
          return;
        
        const date = new Date().toISOString();
        let buy, baseAmount, quoteAmount;

        if (lpTokenAddress.tokenside == TokenSide.token1) {
          buy = lpTokenAddress.network == constant.BINANCE_NETOWRK ? 
            amount1In != 0 && amount0Out != 0 ? "Sell" :"Buy":
            amount0In != 0 && amount1Out != 0 ? "Buy" : "Sell";
          
          baseAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount1Out / Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount1In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) :
            buy == "Buy" ? amount1Out /  Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount1In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) ;
          quoteAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount0In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount0Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) :
            buy == "Buy" ? amount0In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount0Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!);
        } else {
          buy = lpTokenAddress.network == constant.BINANCE_NETOWRK ? 
            amount1In != 0 && amount0Out != 0 ? "Buy" :"Sell":
            amount1In != 0 && amount0Out != 0 ? "Buy" : "Sell";          

          baseAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount0Out / Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount0In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) :
            buy == "Buy" ? amount0Out /  Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount0In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) ;
          quoteAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount1In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount1Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) :
            buy == "Buy" ? amount1In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount1Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!);
        }
        const item = {
          buy_sell: buy,
          baseToken_amount: baseAmount,
          quoteToken_amount: quoteAmount,
          quoteToken_symbol: lpTokenAddress.quoteCurrency_name,
          transaction_hash: event.transactionHash,
          transaction_local_time: date.replace('T', ' ').slice(0, 19),
          transaction_utc_time: date
        } as TransactionType;
        setTempTransactionList([item]);
    });
    subscription = event;
  }

  const srgInit = async() => {

    const currentBlock = await getCurrentBlockNumber(tokenData.network);
    const tempTransaction = await getSRGBuySellTransactions(tokenData.contractAddress.toLowerCase(), tokenData.network, currentBlock);
    setTransactionList(tempTransaction);

    if (lpTokenAddress.network == constant.ETHEREUM_NETWORK) {
      const webWss = new ethers.providers.WebSocketProvider("wss://mainnet.infura.io/ws/v3/e0e919cefdf04a40875a387f51d64516");
      PairContractWSS = new ethers.Contract(lpTokenAddress.contractAddress, SRGToken, webWss); 
    } else {
      const webWss = new ethers.providers.WebSocketProvider("wss://bsc-mainnet.nodereal.io/ws/v1/62368f2c5ac94dc59139d5b255ba1adb");
      PairContractWSS = new ethers.Contract(lpTokenAddress.contractAddress, SRGToken, webWss);
    }
    const eventSell = PairContractWSS.on("Sold", async(from, to, tokens, beans, dollarSell, event) => {
      
      if (tokenData == undefined || tokenData.contractAddress == "" || tokenData.contractAddress.toLowerCase() != lpTokenAddress.ownerToken.toLowerCase())
        return;

      const date = new Date().toISOString();
      const baseAmount = parseInt(tokens._hex, 16) / Math.pow(10, 9);
      const quoteAmount = parseInt(beans._hex, 16) / Math.pow(10, 18);
      
      const item = {
        buy_sell: "Sell",
        baseToken_amount: baseAmount,
        quoteToken_amount: quoteAmount,
        quoteToken_symbol: lpTokenAddress.quoteCurrency_name,
        transaction_hash: event.transactionHash,
        transaction_local_time: date.replace('T', ' ').slice(0, 19),
        transaction_utc_time: date
      } as TransactionType;
      setTempTransactionList([item]);

      // console.log('sold update log', from, to, tokens, beans, dollarSell, event);
      
    });

    const eventBuy = PairContractWSS.on("Bought", async(from, to, tokens, beans, dollarBuy,event) => {
      
      if (tokenData == undefined || tokenData.contractAddress == "" || tokenData.contractAddress.toLowerCase() != lpTokenAddress.ownerToken.toLowerCase())
        return;

      const date = new Date().toISOString();
      const baseAmount = parseInt(tokens._hex, 16) / Math.pow(10, 9);
      const quoteAmount = parseInt(beans._hex, 16) / Math.pow(10, 18);
      
      const item = {
        buy_sell: "Buy",
        baseToken_amount: baseAmount,
        quoteToken_amount: quoteAmount,
        quoteToken_symbol: lpTokenAddress.quoteCurrency_name,
        transaction_hash: event.transactionHash,
        transaction_local_time: date.replace('T', ' ').slice(0, 19),
        transaction_utc_time: date
      } as TransactionType;
      setTempTransactionList([item]);

      // console.log('bought update log', from, to, tokens, beans, dollarBuy, event);
    });    
    subscriptionBuy = eventSell;
    subscriptionSell = eventBuy;

  }

  const callInits = () => {
    if (lpTokenAddress.ownerToken !=undefined && lpTokenAddress.ownerToken != "" && lpTokenAddress.baseCurrency_contractAddress != undefined) {
      if (lpTokenAddress.baseCurrency_contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() || 
          lpTokenAddress.baseCurrency_contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
        srgInit();
      } else {
        init();
      }
    }
  }
  const callRemoveSubscriptions = () => {
    if (subscription) {
      subscription.removeAllListeners();
    }
    if (subscriptionBuy) {
      subscriptionBuy.removeAllListeners();
    }
    if (subscriptionSell) {
      subscriptionSell.removeAllListeners();
    }
  }
  useEffect(() => {
    if (tempTransactionList.length > 0) {
      const temp = [...transactionList];
      temp.unshift(...tempTransactionList);
      setTransactionList(temp);
      setTempTransactionList([]);
    }
  }, [transactionList, tempTransactionList]);

  useEffect(() => {
    callInits();
    const interval = setInterval(() => {
      callRemoveSubscriptions();
      callInits();
    }, RECONNECT_WEBSOCKET);

    return(() => {
      if (interval) {
        clearInterval(interval);
      }
      callRemoveSubscriptions();
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
