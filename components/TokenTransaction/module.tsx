import { BigNumber } from "ethers";
import { getLastTransactionsLogsByTopic } from "../../api";
import { getLimitHistoryData } from "../../api/bitquery_graphql";
import { useLPTokenPrice, useLPTransaction } from "../../hooks";
import * as constant from '../../utils/constant'
import { LPTokenPair, TransactionType } from "../../utils/type";

const TRANSACTION_BLOCK_SHOW = 50;

export async function appendPastTransactions(
  transactionData: TransactionType[],
  lpTokenAddress: LPTokenPair,
  transactionInit: boolean
) {

  const tempTransaction: TransactionType[] = [];
  const date = new Date();

  let beforeTime:string = date.toISOString();
  let transactions;
  if (transactionInit == false) {
    const element = transactionData.at(transactionData.length - 1);
    beforeTime = element?.transaction_utc_time!;
  } else {
    const res = await getLastTransactionsLogsByTopic(
      lpTokenAddress.contractAddress, 
      lpTokenAddress.network
    );
    if (res != constant.NOT_FOUND_TOKEN) {
      console.log('res', res);
      const regex = new RegExp("^0+(?!$)",'g');
      // [...res].reserve().forEach((value:any, index:number) => {
      for (let index = res.length - 1; index >= 0; index--){
        const value = res[index];
        let param_data:string = value.data;
        const transaction_hash = value.transactionHash;
        const timeStamp = parseInt(value.timeStamp, 16);
        const time = new Date(timeStamp * 1000).toISOString();

        beforeTime = time;

        param_data = param_data.slice(2, param_data.length);
        let datas:string[] = param_data.split(/(.{64})/).filter(O=>O)
        datas[0] = datas[0].replaceAll(regex, "");
        datas[1] = datas[1].replaceAll(regex, "");
        datas[2] = datas[2].replaceAll(regex, "");
        datas[3] = datas[3].replaceAll(regex, "");
        
        const amount0In = parseInt(datas[0], 16);
        const amount1In = parseInt(datas[1], 16);
        const amount0Out = parseInt(datas[2], 16);
        const amount1Out = parseInt(datas[3], 16);

        const buy = lpTokenAddress.network == constant.BINANCE_NETOWRK ? 
        amount0In == 0 && amount1Out == 0 ? "Sell" :"Buy":
        amount1In == 0 && amount0Out == 0 ? "Sell" : "Buy";
      
        const baseAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
          buy == "Buy" ? amount1Out / Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount1In / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) :
          buy == "Buy" ? amount1In /  Math.pow(10, lpTokenAddress.baseCurrency_decimals!): amount1Out / Math.pow(10, lpTokenAddress.baseCurrency_decimals!) ;
        const quoteAmount = lpTokenAddress.network == constant.BINANCE_NETOWRK ?
          buy == "Buy" ? amount0In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount0Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) :
          buy == "Buy" ? amount0Out / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!) : amount0In / Math.pow(10, lpTokenAddress.quoteCurrency_decimals!);        
        
        const item = {
          buy_sell: buy,
          baseToken_amount: baseAmount,
          quoteToken_amount: quoteAmount,
          quoteToken_symbol: lpTokenAddress.quoteCurrency_name,
          transaction_hash: transaction_hash,
          transaction_local_time: time.replace('T', ' ').slice(0, 19),
          transaction_utc_time: time,
        } as TransactionType;
        tempTransaction.push(item);
      }
    }
  }

  if (tempTransaction.length > TRANSACTION_BLOCK_SHOW)
    return tempTransaction;

  beforeTime = beforeTime.slice(0, 19);
  transactions = await getLimitHistoryData(
    lpTokenAddress.baseCurrency_contractAddress!,
    lpTokenAddress.quoteCurrency_contractAddress!,
    lpTokenAddress.network,
    beforeTime,
    TRANSACTION_BLOCK_SHOW - tempTransaction.length
  );

  console.log('transactions beforeTime', transactions, beforeTime,TRANSACTION_BLOCK_SHOW - tempTransaction.length);

  if (transactions != constant.NOT_FOUND_TOKEN){

    transactions?.forEach((value:any, index:number) => {
      
      const buy_sell = value.buyCurrency.address == lpTokenAddress.quoteCurrency_contractAddress ? 
        lpTokenAddress.network == constant.BINANCE_NETOWRK ? "Buy" : "Sell": 
        lpTokenAddress.network == constant.BINANCE_NETOWRK ? "Sell" : "Buy"; 

      const baseAmount = value.baseAmount;
      const quoteAmount = value.quoteAmount;
      const utcTime = value.timeInterval.second;
      const txHash = value.any;
      const item = {
        buy_sell: buy_sell,
        baseToken_amount: baseAmount,
        quoteToken_amount: quoteAmount,
        quoteToken_symbol: lpTokenAddress.quoteCurrency_name,
        transaction_utc_time: new Date(utcTime).toISOString(),
        transaction_local_time: utcTime,
        transaction_hash: txHash
      } as TransactionType

      tempTransaction.push(item);

    });
  }

  console.log('return tempTransaction', tempTransaction);

  return tempTransaction; 
  
}