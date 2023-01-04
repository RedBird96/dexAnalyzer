import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Token, Trade, TradeType } from '../utils/type';
import { useSwapState } from '../state/swap/hooks';
import { getTradeExactInOut, getTradeInExactOut } from '../utils/pairs';

export const useTradeExactInOut = (
  tokenIn?: Token | null,
  amountIn?: BigNumber,
  tokenOut?: Token | null
): Trade | null => {
  const { pair } = useSwapState();
  
  return useMemo(() => {
    if (pair && tokenIn && amountIn && tokenOut) {
      const amountOut = getTradeExactInOut(
        amountIn,
        new BigNumber(pair.reserve0),
        new BigNumber(pair.reserve1)
      );
      
      return {
        pair: {
          currencyId: pair.currencyId,
          reserve0: new BigNumber(pair.reserve0),
          reserve1: new BigNumber(pair.reserve1),
        },
        tokenIn,
        tokenOut,
        tradeType: TradeType.EXACT_INPUT,
        amountIn,
        amountOut,
      };
    }

    return null;
  }, [pair, tokenIn, amountIn, tokenOut]);
};

export const useTradeInExactOut = (
  tokenOut?: Token | null,
  amountOut?: BigNumber,
  tokenIn?: Token | null
) => {
  const { pair } = useSwapState();

  return useMemo(() => {
    if (pair && tokenOut && amountOut && tokenIn) {
      const amountIn = getTradeInExactOut(
        amountOut,
        new BigNumber(pair.reserve0),
        new BigNumber(pair.reserve1)
      );

      return {
        pair: {
          currencyId: pair.currencyId,
          reserve0: new BigNumber(pair.reserve0),
          reserve1: new BigNumber(pair.reserve1),
        },
        tokenIn,
        tokenOut,
        tradeType: TradeType.EXACT_OUTPUT,
        amountIn,
        amountOut,
      };
    }

    return null;
  }, [pair, tokenOut, amountOut, tokenIn]);
};
