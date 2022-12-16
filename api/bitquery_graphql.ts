import { gql, request } from 'graphql-request'
import { BLOCKS_CLIENT } from './index'
import { Block } from '../utils/type'
import { BITQUERY_ENDPOINT, BITQUERY_API_KEY } from './index'
import * as constant from '../utils/constant'

export const getlimitHistoryData = async (
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
        options: {desc: "timeInterval.second" limit:100}
        exchangeName: {in: ["Pancake v2"]}
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
        count: count
      }
    }
  }
  `;

  const raw = JSON.stringify({query,"variables": "{}"});

  const response = await fetch(BITQUERY_ENDPOINT, {
    method: 'POST',
    headers: {'X-API-KEY': BITQUERY_API_KEY,
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
    BLOCKS_CLIENT,
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