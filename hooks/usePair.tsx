import { CurrencyAmount, Pair, Currency } from '@pancakeswap/sdk'
import { useEffect, useMemo, useState } from 'react'
import PancakeFactoryAbi from '../config/IPancakeswapV2Factory.json'
import { useTokenInfo } from './useTokenInfo'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { Call, multicallv2 } from '../utils/multicall'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): Promise<[PairState, Pair | null][]> {
  const {tokenData} = useTokenInfo();
  const [callRes, setCallRes] = useState(null);
  const chainId = tokenData.network;

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        try {
          return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
        } catch (error: any) {
          // Debug Invariant failed related to this line
          console.error(
            error.msg,
            `- pairAddresses: ${tokenA?.address}-${tokenB?.address}`,
            `chainId: ${tokenA?.chainId}`,
          )

          return undefined
        }
      }),
    [tokens],
  )

  let reserveCalls: Call[];
  pairAddresses.map((pair:string) => {
    return {
      name: 'getReserves',
      address: pair,
      params: [],
    }
  });
  
  useEffect(() => {
    const callMulticall = async () => {
      const results = await multicallv2(PancakeFactoryAbi, reserveCalls, tokenData.network);
      if (results.length > 0)
        setCallRes(results);
    }
    callMulticall();
  }, [reserveCalls])

  return useMemo(() => {
    return callRes.map((result:any, i:number) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(
          CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
          CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
        ),
      ]
    })
  }, [callRes, tokens])
}

