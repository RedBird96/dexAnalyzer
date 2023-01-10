import { useEffect, useState } from "react";
import { useLPTransaction } from "./useLPTransaction";
import { useLPTokenPrice } from "./useLPTokenPrice";
import { TokenSide, TransactionType } from "../utils/type";


const usePriceImpact = () : number => {

  const {transactionData} = useLPTransaction();
  const {lpTokenAddress} = useLPTokenPrice();
  const [priceImpact, setPriceImpact] = useState<number>(0.01);

  useEffect(() => {
    if (transactionData.length != 0 && lpTokenAddress.token0_reserve != 0 && lpTokenAddress.token1_reserve != 0) {
      let oldToken0_reserve;
      let oldToken1_reserve;
      const lastTransaction:TransactionType = transactionData[0];
      if (lastTransaction.buy_sell == "Buy") {
        if (lpTokenAddress.token0_contractAddress == lpTokenAddress.baseCurrency_contractAddress) {
          oldToken0_reserve = lpTokenAddress.token0_reserve - lastTransaction.baseToken_amount;
          oldToken1_reserve = lpTokenAddress.token1_reserve + lastTransaction.quoteToken_amount;
        } else {
          oldToken1_reserve = lpTokenAddress.token1_reserve - lastTransaction.baseToken_amount;
          oldToken0_reserve = lpTokenAddress.token0_reserve + lastTransaction.quoteToken_amount;
        }
      } else {
        if (lpTokenAddress.token0_contractAddress == lpTokenAddress.baseCurrency_contractAddress) {
          oldToken0_reserve = lpTokenAddress.token0_reserve + lastTransaction.baseToken_amount;
          oldToken1_reserve = lpTokenAddress.token1_reserve - lastTransaction.quoteToken_amount;
        } else {
          oldToken1_reserve = lpTokenAddress.token1_reserve + lastTransaction.baseToken_amount;
          oldToken0_reserve = lpTokenAddress.token0_reserve - lastTransaction.quoteToken_amount;
        }
      }
      const currentPrice = lpTokenAddress.token0_reserve / lpTokenAddress.token1_reserve;
      const oldPrice = oldToken0_reserve / oldToken1_reserve;
      const priceImpact = Math.abs(currentPrice / oldPrice * 100 - 100);
      setPriceImpact(priceImpact);
    }
  }, [transactionData, lpTokenAddress.token0_reserve, lpTokenAddress.token1_reserve])


  return priceImpact;
}

export default usePriceImpact;