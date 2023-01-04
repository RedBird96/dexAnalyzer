import { useMemo } from "react";
import { BINANCE_NETOWRK, ETHEREUM_NETWORK } from "../utils/constant";
import { BASE_TOKEN_LIST } from "../utils/tokens";
import { Pair, Token } from "../utils/type";
import { useTokenInfo } from "./useTokenInfo";
import { flatMap } from "lodash";
import { usePairs } from "./usePair";

export function useAllCommonPairs(tokenA: Token, tokenB: Token): Pair[] {
  
  const {tokenData} = useTokenInfo();
  const chainId = tokenData.network;

  const bases: Token[] = BASE_TOKEN_LIST[tokenData.network == BINANCE_NETOWRK ? BINANCE_NETOWRK : ETHEREUM_NETWORK];
  
  const basePairs: [Token, Token][] = useMemo(
    () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
    [bases],
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA_, tokenB_]) => {
              return true;
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId],
  )  

  // const allPairs = usePairs(allPairCombinations)

  return null;
  
}