import BigNumber from 'bignumber.js';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import { TradeType } from './type';
import { 
  BIG_ONE, 
  BIG_ZERO, 
  BINANCE_NETOWRK, 
  FEES_DENOMINATOR, 
  FEES_NUMERATOR, 
  INIT_CODE_HASH, 
  PANCAKESWAP_FACTORY, 
  UNISWAP_FACTORY
} from './constant';
import PancakePairAbi from '../config/IPancakeswapV2Pair.json'
import PancakeFactoryAbi from '../config/IPancakeswapV2Factory.json'
import UniswapPairAbi from '../config/IUniswapV2Pair.json'
import UniswapFactoryAbi from '../config/IUniswapV2Factory.json'
import { Call, multicallv2 } from './multicall';

export const getPairAddress = async (token0: string, token1: string, network: number): Promise<any> => {

  const reserveCalls: Call[] = [
    {
      name: 'getPair',
      address: network == BINANCE_NETOWRK ? PANCAKESWAP_FACTORY.v2 : UNISWAP_FACTORY.v2, 
      params: [token0, token1],
    },
  ];
  const [reserves] = await multicallv2(network == BINANCE_NETOWRK ? PancakeFactoryAbi : UniswapFactoryAbi, reserveCalls, network);
  return reserves[0];
};

export const getReserves = async (
  pair: string,
  network: number
): Promise<[BigNumber, BigNumber] | null> => {
  const reserveCalls: Call[] = [
    {
      name: 'getReserves',
      address: pair,
      params: [],
    },
  ];
  const [reserves] = await multicallv2(network == BINANCE_NETOWRK ? PancakePairAbi : UniswapPairAbi, reserveCalls, network);
  if (reserves.length < 0) return null;

  return [reserves[0], reserves[1]];
};

export const getToken0Info = async (
  pair: string,
  network: number
): Promise<string> => {
  const reserveCalls: Call[] = [
    {
      name: 'token0',
      address: pair,
      params: [],
    },
  ];
  console.log('pair', pair);
  const [reserves] = await multicallv2(network == BINANCE_NETOWRK ? PancakePairAbi : UniswapPairAbi, reserveCalls, network);
  if (reserves.length < 0) return null;

  return reserves[0];
};

export const getTradeExactInOut = (
  amountIn: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber
): BigNumber | null => {
  if (amountIn.isNaN()) return null;
  if (reserve0.eq(BIG_ZERO) || reserve1.eq(BIG_ZERO)) return null;

  const inputAmountWithFee = amountIn.multipliedBy(FEES_NUMERATOR);
  const numerator = inputAmountWithFee.multipliedBy(reserve1);
  const denominator = new BigNumber(reserve0)
    .multipliedBy(FEES_DENOMINATOR)
    .plus(inputAmountWithFee);
  const outputAmount = numerator.div(denominator);
  return outputAmount;
};

export const getTradeInExactOut = (
  amountOut: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber
): BigNumber | null => {
  if (amountOut.isNaN()) return null;
  if (amountOut.gte(reserve1)) return null;

  const numerator = reserve0
    .multipliedBy(amountOut)
    .multipliedBy(FEES_DENOMINATOR);
  const denominator = reserve1.minus(amountOut).multipliedBy(FEES_NUMERATOR);
  const outputAmount = numerator.div(denominator).dividedBy(BIG_ONE);
  return outputAmount;
};

export const maximumAmountIn = (
  tradeType: TradeType,
  amountIn: BigNumber,
  allowedSlippage: number
): BigNumber => {
  if (allowedSlippage <= 0) return BIG_ZERO;
  if (tradeType === TradeType.EXACT_INPUT) {
    return amountIn;
  }
  const hundred = new BigNumber(10000);
  return amountIn
    .multipliedBy(hundred.plus(allowedSlippage))
    .dividedBy(hundred);
};

export const minimumAmountOut = (
  tradeType: TradeType,
  amountOut: BigNumber,
  allowedSlippage: number
): BigNumber => {
  if (allowedSlippage <= 0) return BIG_ZERO;
  if (tradeType === TradeType.EXACT_OUTPUT) {
    return amountOut;
  }
  const hundred = new BigNumber(10000);
  return amountOut
    .multipliedBy(hundred)
    .dividedBy(hundred.plus(allowedSlippage));
};
