import { gql, request } from 'graphql-request'
import { Block } from '../utils/type'
import * as constant from '../utils/constant'
import * as endpoint from '../utils/endpoints'

export const getRangeHistoryData = async (
  baseAddress: string, 
  quoteAddress: string, 
  network: number,
  after: string,
  before: string,
  count: number
) => {
  const query = `
  {
    ethereum(network: ${network == constant.ETHEREUM_NETWORK ? "ethereum" : "bsc"}) {
      dexTrades(
        options: {desc: "timeInterval.second"}
        exchangeName: {in: ["Pancake v2", "Uniswap"]}
        baseCurrency: {is: "${baseAddress}"}
        quoteCurrency: {is: "${quoteAddress}"}
        time: {after: "${after}", before: "${before}"}
    ) {
        timeInterval {
          second(count: ${count})
        }
        baseCurrency {
          symbol
          address
        }
        baseAmount
        quoteCurrency {
          symbol
          address
        }
        quoteAmount
        quotePrice
        high: quotePrice(calculate: maximum)
        low: quotePrice(calculate: minimum)
        open: minimum(of: block, get: quote_price)
        close: maximum(of: block, get: quote_price)
        volume: quoteAmount
        any(of: tx_hash)
        buyCurrency {
          address
        }
      }
    }
  }
  `;

  const raw = JSON.stringify({query,"variables": "{}"});

  try {
    const response = await fetch(endpoint.BITQUERY_ENDPOINT, {
      method: 'POST',
      headers: {'X-API-KEY': endpoint.BITQUERY_API_KEY,
                "Content-Type":"application/json"},
      body:raw,
      redirect:'follow'
    });  
    if (response.status != 200) {
      return constant.NOT_FOUND_TOKEN;
    }
    const text = await response.json();
    return text["data"].ethereum.dexTrades;
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }

}

export const getLimitHistoryData = async (
  baseAddress: string, 
  quoteAddress: string, 
  network: number,
  before: string,
  limit: number
) => {
  const query = `
  {
    ethereum(network: ${network == constant.ETHEREUM_NETWORK ? "ethereum" : "bsc"}) {
      dexTrades(
        options: {desc: "timeInterval.second" limit:${limit}}
        exchangeName: {in: ["Pancake v2", "Uniswap"]}
        baseCurrency: {is: "${baseAddress}"}
        quoteCurrency: {is: "${quoteAddress}"}
        time: {before: "${before}"}
    ) {
        timeInterval {
          second(count: 1)
        }
        baseCurrency {
          symbol
          address
        }
        baseAmount
        quoteCurrency {
          symbol
          address
        }
        quoteAmount
        quotePrice
        high: quotePrice(calculate: maximum)
        low: quotePrice(calculate: minimum)
        open: minimum(of: block, get: quote_price)
        close: maximum(of: block, get: quote_price)
        volume: quoteAmount
        any(of: tx_hash)
        buyCurrency {
          address
        }
      }
    }
  }
  `;

  const raw = JSON.stringify({query,"variables": "{}"});

  try {
    const response = await fetch(endpoint.BITQUERY_ENDPOINT, {
      method: 'POST',
      headers: {'X-API-KEY': endpoint.BITQUERY_API_KEY,
                "Content-Type":"application/json"},
      body:raw,
      redirect:'follow'
    });  
    if (response.status != 200) {
      return constant.NOT_FOUND_TOKEN;
    }
    const text = await response.json();
    return text["data"].ethereum.dexTrades;
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }

}

export const getLPPairs = async (
  baseAddress: string, 
  network: number
) => {
  const stable_coin1 = network == constant.BINANCE_NETOWRK ? constant.WHITELIST_TOKENS.BSC.BNB : constant.WHITELIST_TOKENS.ETH.ETH;
  const stable_coin2 = network == constant.BINANCE_NETOWRK ? constant.WHITELIST_TOKENS.BSC.USDC : constant.WHITELIST_TOKENS.ETH.USDC;
  const stable_coin3 = network == constant.BINANCE_NETOWRK ? constant.WHITELIST_TOKENS.BSC.USDT : constant.WHITELIST_TOKENS.ETH.USDT;
  const stable_coin4 = network == constant.BINANCE_NETOWRK ? constant.WHITELIST_TOKENS.BSC.DAI : constant.WHITELIST_TOKENS.ETH.DAI;
  const stable_coin5 = network == constant.BINANCE_NETOWRK ? constant.WHITELIST_TOKENS.BSC.CAKE : constant.WHITELIST_TOKENS.ETH.UNI;
  const stable_coin6 = network == constant.BINANCE_NETOWRK ? constant.WHITELIST_TOKENS.BSC.BUSD : constant.WHITELIST_TOKENS.ETH.UNI;
  const query = `
  {
    ethereum(network: ${network == constant.ETHEREUM_NETWORK ? "ethereum" : "bsc"}) {
      dexTrades(
        exchangeName: {in: ["Pancake v2", "Uniswap"]}
        baseCurrency: {is: "${baseAddress}"}
        quoteCurrency: {in: ["${stable_coin1}", "${stable_coin2}", "${stable_coin3}", "${stable_coin4}", "${stable_coin5}", "${stable_coin6}"]}
      ) {
        baseCurrency {
          address
          name
          symbol
          decimals
        }
        quoteCurrency {
          address
          name
          symbol
          decimals
        }
        smartContract {
          address {
            address
          }
          protocolType
        }
      }
    }
  }
  `;

  const raw = JSON.stringify({query,"variables": "{}"});

  const response = await fetch(endpoint.BITQUERY_ENDPOINT, {
    method: 'POST',
    headers: {'X-API-KEY': endpoint.BITQUERY_API_KEY,
              "Content-Type":"application/json"},
    body:raw,
    redirect:'follow'
  });  
  if (response.status != 200) {
    return constant.NOT_FOUND_TOKEN;
  }
  try {
    const text = await response.json();
    return text["data"].ethereum.dexTrades;
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }

}


const getBlockSubqueries = (timestamps: number[]) =>
  timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })

const blocksQueryConstructor = (subqueries: string[]) => {
  return gql`query blocks {
    ${subqueries}
  }`
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @param {Array} timestamps
 */
 export const getBlocksFromTimestamps = async (
  timestamps: number[],
  sortDirection: 'asc' | 'desc' = 'desc',
  skipCount = 500,
): Promise<Block[]> => {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData: any = await multiQuery(
    blocksQueryConstructor,
    getBlockSubqueries(timestamps),
    endpoint.BLOCKS_CLIENT,
    skipCount,
  )

  const sortingFunction =
    sortDirection === 'desc' ? (a: Block, b: Block) => b.number - a.number : (a: Block, b: Block) => a.number - b.number

  const blocks: Block[] = []
  if (fetchedData) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(fetchedData)) {
      if (fetchedData[key].length > 0) {
        blocks.push({
          timestamp: key.split('t')[1],
          number: parseInt(fetchedData[key][0].number, 10),
        })
      }
    }
    // graphql-request does not guarantee same ordering of batched requests subqueries, hence manual sorting
    blocks.sort(sortingFunction)
  }
  return blocks
}

/**
 * Helper function to get large amount GrqphQL subqueries
 * @param queryConstructor constructor function that combines subqueries
 * @param subqueries individual queries
 * @param endpoint GraphQL endpoint
 * @param skipCount how many subqueries to fire at a time
 * @returns
 */
 export const multiQuery = async (
  queryConstructor: (subqueries: string[]) => string,
  subqueries: string[],
  endpoint: string,
  skipCount = 1000,
) => {
  let fetchedData = {}
  let allFound = false
  let skip = 0
  try {
    while (!allFound) {
      let end = subqueries.length
      if (skip + skipCount < subqueries.length) {
        end = skip + skipCount
      }
      const subqueriesSlice = subqueries.slice(skip, end)
      // eslint-disable-next-line no-await-in-loop
      const result = await request(endpoint, queryConstructor(subqueriesSlice))
      fetchedData = {
        ...fetchedData,
        ...result,
      }
      allFound = Object.keys(result).length < skipCount || skip + skipCount > subqueries.length
      skip += skipCount
    }
    return fetchedData
  } catch (error) {
    console.error('Failed to fetch info data', error)
    return null
  }
}