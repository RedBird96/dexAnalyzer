import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { useCallback, useMemo } from 'react';
import { maximumAmountIn, minimumAmountOut } from '../utils/pairs';
import { Trade, TradeType } from '../utils/type';
import { BINANCE_NETOWRK, BNBToken, BSCRPC_URL, ETHEREUM_NETWORK, ETHERToken, ETHRPC_URL, WHITELIST_TOKENS } from '../utils/constant';
import isZero, { calculateGasMargin } from '../utils/tx';
import SRGToken from '../config/SRGToken.json';
import { getRouterContract } from '../utils/contract';
import { useAddress, useSigner } from '@thirdweb-dev/react';
import { useTokenInfo } from './useTokenInfo';
import { ethers } from 'ethers';

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

interface FailSwapCall {
  call: SwapCall;
  gasError: any;
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
    const errorEstimation = estimateCalls.find(
      (el): el is FailSwapCall => 'gasError' in el
    );
    if (!successfulEstimation) {
      throw new Error(errorEstimation.gasError.reason);
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

export const useSRGBuy = async ({
  address,
  network,
  signer,
  bnbAmount,
  minTokenOut,
  deadline
}:{
  address:string,
  network:number
  signer:any,
  bnbAmount:BigNumber,
  minTokenOut:BigNumber,
  deadline:number
}) => {

  let TokenContract:ethers.Contract;
  if (network == ETHEREUM_NETWORK) {
    const provider = new ethers.providers.JsonRpcProvider(ETHRPC_URL, ETHEREUM_NETWORK);
    TokenContract = new ethers.Contract(address, SRGToken , provider)
  } else if (network == BINANCE_NETOWRK) {
    const provider = new ethers.providers.JsonRpcProvider(BSCRPC_URL, BINANCE_NETOWRK);
    TokenContract = new ethers.Contract(address, SRGToken, provider)
  }

  try{
    const estimateGasLimit = await TokenContract.connect(signer).estimateGas._buy(minTokenOut, deadline, {value:bnbAmount});
    const transaction = await TokenContract.connect(signer)._buy(minTokenOut, deadline, {value:bnbAmount, gasLimit:estimateGasLimit});
    const response = await transaction.wait();
    return Boolean(response);
  } catch(ex) {
    console.log(ex);
  }
  return false;
}

export const useSRGSell = async ({
  address,
  network,
  signer,
  tokenAmount,
  deadline,
  minBNBOut
}:{
  address:string,
  network:number
  signer:any,
  tokenAmount:BigNumber,
  deadline:number,
  minBNBOut:BigNumber
}) => {

  let TokenContract:ethers.Contract;
  if (network == ETHEREUM_NETWORK) {
    const provider = new ethers.providers.JsonRpcProvider(ETHRPC_URL, ETHEREUM_NETWORK);
    TokenContract = new ethers.Contract(address, SRGToken , provider)
  } else if (network == BINANCE_NETOWRK) {
    const provider = new ethers.providers.JsonRpcProvider(BSCRPC_URL, BINANCE_NETOWRK);
    TokenContract = new ethers.Contract(address, SRGToken, provider)
  }

  const estimateGasLimit = await TokenContract.connect(signer).estimateGas._sell(tokenAmount, deadline, minBNBOut);
  const transaction = await TokenContract.connect(signer)._sell(tokenAmount, deadline, minBNBOut, {gasLimit:estimateGasLimit});
  const response = await transaction.wait();
  return Boolean(response);
}

export default useSwap;
