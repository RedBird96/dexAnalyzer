import BigNumber from 'bignumber.js';
import { 
  BINANCE_NETOWRK, 
  PANCAKESWAP_ROUTER, 
  UNISWAP_ROUTER 
} from './constant';
import SRGToken from '../config/SRGToken.json';
import PancakeRouterAbi from '../config/Pancakerouter02.json'
import UniswapRouterAbi from '../config/IUniswapV2Router.json'
import { Call, multicallv2 } from './multicall';


export const getAmountOut = async(
  token0: string,
  token1: string,
  tokenAmount: BigNumber,
  network: number
): Promise<any> => {
  
  const amountIn = tokenAmount.toString(10);
  const path = [token0, token1];
  const address = network == BINANCE_NETOWRK ? PANCAKESWAP_ROUTER.v2 : UNISWAP_ROUTER.v2;
  const reserveCalls: Call[] = [
    {
      name: 'getAmountsOut',
      address: address,
      params: [
        amountIn,
        path
      ],
    }
  ];
  const reserves = await multicallv2(network == BINANCE_NETOWRK ? PancakeRouterAbi : UniswapRouterAbi, reserveCalls, network);
  if (reserves.length < 0) return null;
  return reserves[0];
}


export const getAmountIn = async(
  token0: string,
  token1: string,
  tokenAmount: BigNumber,
  network: number
): Promise<any> => {
  
  const amountOut = tokenAmount.toString(10);
  const path = [token0, token1];
  const address = network == BINANCE_NETOWRK ? PANCAKESWAP_ROUTER.v2 : UNISWAP_ROUTER.v2;
  const reserveCalls: Call[] = [
    {
      name: 'getAmountsIn',
      address: address,
      params: [
        amountOut,
        path
      ],
    }
  ];
  const reserves = await multicallv2(network == BINANCE_NETOWRK ? PancakeRouterAbi : UniswapRouterAbi, reserveCalls, network);
  if (reserves.length < 0) return null;
  return reserves[0];
}


export const getBNBAmountOut_SRG = async(
  address: string,
  tokenAmount: BigNumber,
  network: number
): Promise<any> => {
  
  const amountIn = tokenAmount.toString(10);
  const reserveCalls: Call[] = [
    {
      name: 'getBNBAmountOut',
      address: address,
      params: [
        amountIn
      ],
    }
  ];
  const reserves = await multicallv2(SRGToken, reserveCalls, network);
  if (reserves.length < 0) return null;
  return reserves[0];
}

export const getTokenAmountOut_SRG = async(
  address: string,
  tokenAmount: BigNumber,
  network: number
): Promise<any> => {
  
  const amountBNBIn = tokenAmount.toString(10);
  const reserveCalls: Call[] = [
    {
      name: 'getTokenAmountOut',
      address: address,
      params: [
        amountBNBIn
      ],
    }
  ];
  const reserves = await multicallv2(SRGToken, reserveCalls, network);
  if (reserves.length < 0) return null;
  return reserves[0];
}

export const getPairPrice = async (
  quoteToken: string,
  baseToken: string,
  tokenAmount: BigNumber,
  network: number
): Promise<any> => {
  
  const amountIn = tokenAmount.toString(10);
  const amountOut = amountIn;
  const path = [quoteToken, baseToken];
  const address = network == BINANCE_NETOWRK ? PANCAKESWAP_ROUTER.v2 : UNISWAP_ROUTER.v2;
  const reserveCalls: Call[] = [
    {
      name: 'getAmountsOut',
      address: address,
      params: [
        amountIn,
        path
      ],
    },
    {
      name: 'getAmountsIn',
      address: address,
      params: [
        amountOut,
        path
      ],
    },    
  ];
  const reserves = await multicallv2(network == BINANCE_NETOWRK ? PancakeRouterAbi : UniswapRouterAbi, reserveCalls, network);
  if (reserves.length < 0) return null;
  return reserves;
}