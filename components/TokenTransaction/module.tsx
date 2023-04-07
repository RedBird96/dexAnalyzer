import { getLastTransactionsLogsByTopic } from "../../api";
import { getLimitHistoryData } from "../../api/bitquery_graphql";
import * as constant from '../../utils/constant'
import { ERC20Token, LPTokenPair, TokenSide, TransactionType } from "../../utils/type";

const TRANSACTION_BLOCK_SHOW = 50;

export function ConvertEventtoTransaction(value:any, lpTokenAddress:LPTokenPair) {
  let param_data:string = value.data;
  const regex = new RegExp("^0+(?!$)",'g');
  const transaction_hash = value.transactionHash;
  const timeStamp = parseInt(value.timeStamp, 16);
  const time = new Date(timeStamp * 1000).toISOString();

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
    transaction_hash: transaction_hash,
    transaction_local_time: time.replace('T', ' ').slice(0, 19),
    transaction_utc_time: time,
  } as TransactionType;

  return item;
}

export async function appendPastTransactions(
  transactionData: TransactionType[],
  lpTokenAddress: LPTokenPair,
  transactionInit: boolean,
  tokenData: ERC20Token
) {

  const tempTransaction: TransactionType[] = [];
  const date = new Date();

  let beforeTime:string = date.toISOString();
  let transactions;
  if (transactionInit == false) {
    const element = transactionData.at(transactionData.length - 1);
    beforeTime = element?.transaction_utc_time!;
    if (beforeTime.at(11) != "T")
      beforeTime = beforeTime.substring(0, 10) + "T" + beforeTime.substring(11);
  } else {
    const res = await getLastTransactionsLogsByTopic(
      lpTokenAddress.contractAddress, 
      lpTokenAddress.network
    );
    if (res != constant.NOT_FOUND_TOKEN) {
      // [...res].reserve().forEach((value:any, index:number) => {
      for (let index = res.length - 1; index >= 0; index--){
        const value = res[index];
        const timeStamp = parseInt(value.timeStamp, 16);
        const time = new Date(timeStamp * 1000).toISOString();

        beforeTime = time;
        const item = ConvertEventtoTransaction(value, lpTokenAddress);
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
    TRANSACTION_BLOCK_SHOW - tempTransaction.length,
    tokenData.controller?.signal
  );
  if (transactions != constant.NOT_FOUND_TOKEN){

    transactions?.forEach((value:any, index:number) => {
      
      let buy_sell;

      buy_sell = value.buyCurrency.address == lpTokenAddress.quoteCurrency_contractAddress ? "Buy" : "Sell";
      const baseAmount = value.baseAmount;
      const quoteAmount = value.quoteAmount;
      const utcTime = value.timeInterval.second;
      const txHash = value.any;
      const item = {
        buy_sell: buy_sell,
        baseToken_amount: baseAmount,
        quoteToken_amount: quoteAmount,
        quoteToken_symbol: lpTokenAddress.quoteCurrency_name,
        transaction_utc_time: utcTime,
        transaction_local_time: utcTime,
        transaction_hash: txHash
      } as TransactionType

      tempTransaction.push(item);

    });
  }

  return tempTransaction; 
  
}
