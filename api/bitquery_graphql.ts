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


export const getHoldTransferCount = async (
  address: string, 
  network: number
) => {

  const query = `
  {
    ethereum(network: ${network == constant.ETHEREUM_NETWORK ? "ethereum" : "bsc"}) {
      transfers(
        currency: {is: "${address}"}
        options: {limitBy: {each: "currency.address", limit: 10}}
      ) {
        currency {
          address
          name
          decimals
        }
        count(uniq: receivers, amount: {gteq: 1})
        countBigInt(uniq: transfers)
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
    return text["data"].ethereum.transfers;
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }

}

