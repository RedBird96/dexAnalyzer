import React, { useContext, useEffect, useState } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { AbiItem } from 'web3-utils'
import Web3 from "web3";
import { useLPTokenPrice } from "./useLPTokenPrice";
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import * as constant from '../utils/constant'

interface LPTransactionInterface {
  transactionData: any[];
  setTransactionData: (txData: any[]) => void;
}

const LPTransactionContext: React.Context<null | LPTransactionInterface> =
  React.createContext<null | LPTransactionInterface>(null);

export function LPTransactionProvider({children}:any) {

  const [transactionList, setTransactionList] = useState<any[]>([]);
  const {lpTokenAddress} = useLPTokenPrice();
  let web3Wss: any, web3Http: any, PairContractWSS:Contract, PairContractHttp:Contract;

  useEffect(() => {

    const init = async() => {
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
      
      const filterSync = PairContractWSS.filters.Swap()
      const event = PairContractWSS.on(filterSync, async(sender, amount0In, 
        amount1In, amount0Out, amount1Out, to, event) => {
          transactionList.unshift()
          let time = new Date().toJSON();
          time = time.replace('T', ' ');
          time = time.slice(0, 19);
          const buy = lpTokenAddress.network == constant.BINANCE_NETOWRK ? 
            amount0In == 0 && amount1Out == 0 ? "Buy" :"Sell":
            amount1In == 0 && amount0Out == 0 ? "Buy" : "Sell";
          
          const baseAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount0Out / Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount0In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) :
            buy == "Buy" ? amount1Out /  Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount1In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) ;
          const quoteAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
            buy == "Buy" ? amount1In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount1Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) :
            buy == "Buy" ? amount0In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount0Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!);

          const item = {
            buyCurrency:{
              address: lpTokenAddress.baseCurrency_contractAddress
            },
            quoteCurrency:{
              address: amount0In == 0 && amount1Out == 0 ?  lpTokenAddress.baseCurrency_contractAddress: lpTokenAddress.quoteCurrency_contractAddress
            },
            any: event.transactionHash,
            baseAmount: baseAmount,
            quoteAmount: quoteAmount,
            timeInterval :{
              second:time
            }

          }
          const temp = transactionList;
          temp.unshift(item);
          setTransactionList(temp);
          // console.log('swap transaction', amount0In, amount1In, amount0Out, amount1Out, to, event);
      });

    }

    init();

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
