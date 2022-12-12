import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Token } from '@pancakeswap/sdk'
import { TokenAddressMap as TTokenAddressMap, WrappedTokenInfo, TokenList, TokenInfo } from '@pancakeswap/token-lists'
import { ListsState } from '@pancakeswap/token-lists/react'
import { deserializeToken } from '@pancakeswap/token-lists'
import { Currency, ERC20Token, ChainId } from '@pancakeswap/sdk'
import { createSelector } from '@reduxjs/toolkit'
import uniqBy from 'lodash/uniqBy'
import groupBy from 'lodash/groupBy'
import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'
import DEFAULT_TOKEN_LIST from '../config/default-tokenlist.json'
import UNSUPPORTED_TOKEN_LIST from '../config/unsupported-tokenlist.json'
import WARNING_TOKEN_LIST from '../config/warning-tokelinst.json'
import { 
  DEFAULT_LIST_OF_LISTS, 
  OFFICIAL_LISTS, 
  UNSUPPORTED_LIST_URLS, 
  WARNING_LIST_URLS 
} from '../utils/constant'
import { atom, useAtomValue } from 'jotai'
import { listsAtom } from '../utils/lists'

type TokenAddressMap = TTokenAddressMap<ChainId>

export const EMPTY_LIST: TTokenAddressMap<ChainId> = {
  [ChainId.ETHEREUM]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.GOERLI]: {},
  [ChainId.BSC]: {},
  [ChainId.BSC_TESTNET]: {},
}

const selectUserTokens = ({ user: { tokens } }: AppState) => tokens

export const userAddedTokenSelector = (chainId: number) =>
  createSelector(selectUserTokens, (serializedTokensMap) =>
    Object.values(serializedTokensMap?.[chainId] ?? {}).map(deserializeToken),
  )

export default function useUserAddedTokens(): Token[] {
  const chainId = 56;
  return useSelector(useMemo(() => userAddedTokenSelector(chainId), [chainId]))
}

const mapWithoutUrls = (tokenMap: TTokenAddressMap<ChainId>, chainId: number) =>
  Object.keys(tokenMap[chainId] || {}).reduce<{ [address: string]: ERC20Token }>((newMap, address) => {
    newMap[address] = tokenMap[chainId][address].token
    return newMap
  }, {})


function sortByListPriority(urlA: string, urlB: string) {
  const first = DEFAULT_LIST_OF_LISTS.includes(urlA) ? DEFAULT_LIST_OF_LISTS.indexOf(urlA) : Number.MAX_SAFE_INTEGER
  const second = DEFAULT_LIST_OF_LISTS.includes(urlB) ? DEFAULT_LIST_OF_LISTS.indexOf(urlB) : Number.MAX_SAFE_INTEGER

  // need reverse order to make sure mapping includes top priority last
  if (first < second) return 1
  if (first > second) return -1
  return 0
}

export const selectorByUrlsAtom = atom((get) => get(listsAtom)?.byUrl ?? {})
const selectorActiveUrlsAtom = atom((get) => get(listsAtom)?.activeListUrls ?? [])

function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  return {
    [ChainId.ETHEREUM]: { ...map1[ChainId.ETHEREUM], ...map2[ChainId.ETHEREUM] },
    [ChainId.RINKEBY]: { ...map1[ChainId.RINKEBY], ...map2[ChainId.RINKEBY] },
    [ChainId.GOERLI]: { ...map1[ChainId.GOERLI], ...map2[ChainId.GOERLI] },
    [ChainId.BSC]: { ...map1[ChainId.BSC], ...map2[ChainId.BSC] },
    [ChainId.BSC_TESTNET]: { ...map1[ChainId.BSC_TESTNET], ...map2[ChainId.BSC_TESTNET] },
  }
}

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[]
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

  
const combineTokenMaps = (lists: ListsState['byUrl'], urls: string[]) => {
  if (!urls) return EMPTY_LIST
  return (
    urls
      .slice()
      // sort by priority so top priority goes last
      .sort(sortByListPriority)
      .reduce((allTokens, currentUrl) => {
        const current = lists[currentUrl]?.current
        if (!current) return allTokens
        try {
          const newTokens = Object.assign(listToTokenMap(current))
          return combineMaps(allTokens, newTokens)
        } catch (error) {
          console.error('Could not show token list due to error', error)
          return allTokens
        }
      }, EMPTY_LIST)
  )
}

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result

  const tokenMap: WrappedTokenInfo[] = uniqBy(
    list.tokens,
    (tokenInfo) => `${tokenInfo.chainId}#${tokenInfo.address}`,
  ).map((tokenInfo) => new WrappedTokenInfo(tokenInfo))

  const groupedTokenMap: { [chainId: string]: WrappedTokenInfo[] } = groupBy(tokenMap, 'chainId')

  const tokenAddressMap = mapValues(groupedTokenMap, (tokenInfoList) =>
    mapValues(keyBy(tokenInfoList, 'address'), (tokenInfo) => ({ token: tokenInfo, list })),
  ) as TokenAddressMap

  // add chain id item if not exist
  enumKeys(ChainId).forEach((chainId) => {
    if (!(ChainId[chainId] in tokenAddressMap)) {
      Object.defineProperty(tokenAddressMap, ChainId[chainId], {
        value: {},
      })
    }
  })

  listCache?.set(list, tokenAddressMap)
  return tokenAddressMap
}

const combineTokenMapsWithDefault = (lists: ListsState['byUrl'], urls: string[]) => {
  const defaultTokenMap = listToTokenMap(DEFAULT_TOKEN_LIST)
  if (!urls) return defaultTokenMap
  return combineMaps(combineTokenMaps(lists, urls), defaultTokenMap)
}

export const combinedTokenMapFromActiveUrlsAtom = atom((get) => {
  const [selectorByUrls, selectorActiveUrls] = [get(selectorByUrlsAtom), get(selectorActiveUrlsAtom)]
  return combineTokenMapsWithDefault(selectorByUrls, selectorActiveUrls)
})

/**
 * Returns all tokens that are from active urls and user added tokens
 */
 export function useAllTokens(): { [address: string]: ERC20Token } {
  const chainId = 56;
  const tokenMap = useAtomValue(combinedTokenMapFromActiveUrlsAtom)
  const userAddedTokens = useUserAddedTokens()
  return useMemo(() => {
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: ERC20Token }>(
          (tokenMap_, token) => {
            tokenMap_[token.address] = token
            return tokenMap_
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          mapWithoutUrls(tokenMap, chainId),
        )
    )
  }, [userAddedTokens, tokenMap, chainId])
}

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  return useAtomValue(selectorByUrlsAtom)
}

export function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
  const lists = useAllLists()
  const inactiveUrls = useInactiveListUrls()
  const { chainId } = useActiveChainId()
  const activeTokens = useAllTokens()
  return useMemo(() => {
    if (!search || search.trim().length === 0) return []
    const filterToken = createFilterToken(search)
    const exactMatches: WrappedTokenInfo[] = []
    const rest: WrappedTokenInfo[] = []
    const addressSet: { [address: string]: true } = {}
    const trimmedSearchQuery = search.toLowerCase().trim()
    for (const url of inactiveUrls) {
      const list = lists[url].current
      // eslint-disable-next-line no-continue
      if (!list) continue
      for (const tokenInfo of list.tokens) {
        if (
          tokenInfo.chainId === chainId &&
          !(tokenInfo.address in activeTokens) &&
          !addressSet[tokenInfo.address] &&
          filterToken(tokenInfo)
        ) {
          const wrapped: WrappedTokenInfo = new WrappedTokenInfo(tokenInfo)
          addressSet[wrapped.address] = true
          if (
            tokenInfo.name?.toLowerCase() === trimmedSearchQuery ||
            tokenInfo.symbol?.toLowerCase() === trimmedSearchQuery
          ) {
            exactMatches.push(wrapped)
          } else {
            rest.push(wrapped)
          }
        }
      }
    }
    return [...exactMatches, ...rest].slice(0, minResults)
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search])
}