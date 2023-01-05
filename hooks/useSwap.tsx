import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { useCallback, useMemo } from 'react';
import { maximumAmountIn, minimumAmountOut } from '../utils/pairs';
import { Trade, TradeType } from '../utils/type';
import { BINANCE_NETOWRK, BNBToken, ETHERToken, WHITELIST_TOKENS } from '../utils/constant';
import isZero, { calculateGasMargin } from '../utils/tx';
import { getRouterContract } from '../utils/contract';
import { useAddress, useSigner } from '@thirdweb-dev/react';
import { useTokenInfo } from './useTokenInfo';

interface SwapParameters {
  methodName: string;
  args: (string | string[])[];
  value: string;
}

interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

interface SuccessfulSwapCall {
  call: SwapCall;
  gasEstimate: BigNumber;
}

export const useSwapArguments = (
  trade: Trade | null,
  allowedSlippage: number
): SwapCall[] => {

  const {tokenData} = useTokenInfo();
  const account = useAddress();
  const library = useSigner();
  return useMemo(() => {
    if (!trade || !library || !account) return [];

    const contract = getRouterContract(library, tokenData.network);
    const etherIn = (trade.tokenIn === ETHERToken || trade.tokenIn === BNBToken);
    const etherOut = (trade.tokenOut === ETHERToken || trade.tokenOut == BNBToken);

    const wNative = tokenData.network == BINANCE_NETOWRK ? WHITELIST_TOKENS.BSC.BNB : WHITELIST_TOKENS.ETH.ETH;

    const path = [
      etherIn ? wNative : trade.tokenIn.address,
      etherOut ? wNative : trade.tokenOut.address,
    ];
    const amountIn = trade.amountIn
      ? `0x${maximumAmountIn(trade.tradeType, trade.amountIn, allowedSlippage)
          .integerValue()
          .toString(16)}`
      : '0x0';
    const amountOut = trade.amountOut
      ? `0x${minimumAmountOut(trade.tradeType, trade.amountOut, allowedSlippage)
          .integerValue()
          .toString(16)}`
      : '0x0';
    const deadline = `0x${(
      Math.floor(new Date().getTime() / 1000) + 300
    ).toString(16)}`;

    let methodName: string;
    let args: (string | string[])[];
    let value: string;

    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = 'swapExactETHForTokensSupportingFeeOnTransferTokens';
          args = [amountOut, path, account, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = 'swapExactTokensForETHSupportingFeeOnTransferTokens';
          args = [amountIn, amountOut, path, account, deadline];
          value = '0x0';
        } else {
          methodName = 'swapExactTokensForTokensSupportingFeeOnTransferTokens';
          args = [amountIn, amountOut, path, account, deadline];
          value = '0x0';
        }
        break;

      case TradeType.EXACT_OUTPUT:
        if (etherIn) {
          methodName = 'swapETHForExactTokens';
          args = [amountOut, path, account, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH';
          args = [amountOut, amountIn, path, account, deadline];
          value = '0x0';
        } else {
          methodName = 'swapTokensForExactTokens';
          args = [amountOut, amountIn, path, account, deadline];
          value = '0x0';
        }
        break;
    }
    
    return [
      {
        contract,
        parameters: {
          methodName,
          args,
          value,
        }
      },
    ];
  }, [trade, allowedSlippage, library, account]);
};

const useSwap = (
  trade: Trade | null,
  allowedSlippage: number
): {
  onSwap: () => Promise<TransactionResponse>;
} => {
  
  const account = useAddress();

  const swapCalls = useSwapArguments(trade, allowedSlippage);
  const onSwap = useCallback(async () => {
    const estimateCalls = await Promise.all(
      swapCalls.map(call => {
        const {
          parameters: { methodName, args, value },
          contract,
        } = call;
        
        const options = !value || isZero(value) ? {} : { value };
        return contract.estimateGas[methodName](...args, options)
          .then(gasEstimate => ({
            call,
            gasEstimate,
          }))
          .catch(gasError => ({
            call,
            gasError,
          }));
      })
    );
    
    const successfulEstimation = estimateCalls.find(
      (el): el is SuccessfulSwapCall => 'gasEstimate' in el
    );
    if (!successfulEstimation) {
      throw new Error('Unexpected error. Could not estimate gas for the swap');
    }
    const {
      call: {
        contract,
        parameters: { methodName, args, value },
      },
      gasEstimate,
    } = successfulEstimation;
    return contract[methodName](...args, {
      gasLimit: calculateGasMargin(gasEstimate),
      ...(value && !isZero(value)
        ? { value, from: account }
        : { from: account }),
    });
  }, [account, swapCalls]);

  return {
    onSwap,
  };
  
};

export default useSwap;
