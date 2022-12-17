import { ethers } from "ethers";
import { request, gql } from 'graphql-request';
import fetch from 'cross-fetch';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'
import ERC20TokenABI from '../config/ERC20ABI.json'
import BEP20TokenABI from '../config/ERC20ABI.json'
import EtherscanClient, {Action} from './ethers/etherscan-client';
import {ERC20Token, LPTokenPair, TokenSide} from '../utils/type'
import * as constant from '../utils/constant'
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import { useStableCoinPrice } from "../hooks/useStableCoinPrice";
import { getLPPairs } from "./bitquery_graphql";

export const ETH_MAINNET_API_URL = 'https://api.etherscan.io/api';
export const BSC_MAINNET_API_URL = 'https://api.bscscan.com/api';
export const ETH_MAINNET_PLORER_API_URL = 'https://api.ethplorer.io/';
export const ETHPLORER_API_KEY = 'EK-32KDR-3MoJfLq-QoUAU';
export const BITQUERY_API_KEY = 'BQY1hd2LPoxnm8ouc723BqPL47Jk7k46';
export const COINMARKETCAP_API_KEY = 'd27ab07a-3853-4402-8d56-651767ba4da5';
const ETH_MAINNET_CONNECTION = {
  apiKey: 'DF8U1AYKKAW8NHQQJ2H34W6B49H38JI9SU',
  apiUrl: ETH_MAINNET_API_URL
};
const BSC_MAINNET_CONNECTION = {
  apiKey: '9JXFSN6Y82GSADZZRHHNDD29AMYFMB7XYS',
  apiUrl: BSC_MAINNET_API_URL
}
export const CMC_ENDPOINT = 'https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/contract?address='
export const CG_ENDPOINT = 'https://api.coingecko.com/api/v3/';
export const PC_PAIRS = "https://api.thegraph.com/subgraphs/name/pancakeswap/pairs";
export const SH_PAIRS = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
export const LLAMA_ENDPOINT = "https://coins.llama.fi/";
export const BLOCKS_CLIENT = "https://api.thegraph.com/subgraphs/name/pancakeswap/blocks";
export const INFO_CLIENT = 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2';
export const BITQUERY_ENDPOINT = "https://graphql.bitquery.io";

export async function getContractInfoFromWalletAddress(address:string, network: number) {

  if (network == constant.ETHEREUM_NETWORK) {
    const url = ETH_MAINNET_PLORER_API_URL + 
      "getAddressInfo/" + 
      address + 
      "?apiKey=" + 
      ETHPLORER_API_KEY;
    let text: string;
    const response = await fetch(url);
    if (response.status != 200) {
      return constant.NOT_FOUND_TOKEN;
    }
    try {
      text = await response.text();
    } catch (err:any) {
      return constant.NOT_FOUND_TOKEN;
    }
    return JSON.parse(text);
  } else {
    const web3_bsc = new Web3(constant.BSCRPC_URL);
    const bnbBalance = parseInt(await web3_bsc.eth.getBalance(address))/ Math.pow(10, 18);
    const bnbPrice = await getTokenPricefromllama(constant.WHITELIST_TOKENS.BSC.BNB, constant.BINANCE_NETOWRK);
    const usdBalance = bnbPrice * bnbBalance;
    let bnbToken:ERC20Token = {
      name: "WBNB",
      decimals: 18,
      symbol: "WBNB",
      contractAddress: constant.WHITELIST_TOKENS.BSC.BNB,
      balance: bnbBalance,
      usdBalance: usdBalance,
      network: constant.BINANCE_NETOWRK,
      price: bnbPrice,
      holdersCount: 0,
      image: "",
      owner: "",
      totalSupply: 0,
      marketCap: "",
      pinSetting: false      
    }               
    let tokenList:ERC20Token[] = [];
    const eth = new EtherscanClient(BSC_MAINNET_CONNECTION);
    const res = await eth.call(Action.account_tokentx, {address});
    let address_str = "";
    for(let ind = 0; ind < res.result.length; ind ++) {
      if (res.result[ind].hasOwnProperty('tokenDecimal')) {
        const add = res.result[ind].contractAddress;
        const decimal = res.result[ind].tokenDecimal;
        const value  = res.result[ind].value;
        const symbol = res.result[ind].tokenSymbol;
        const name = res.result[ind].tokenName;
        const from = res.result[ind].from;
        const to = res.result[ind].to;
        const balance = parseInt(value) / Math.pow(10, decimal);
        if (to.toLowerCase() == address.toLowerCase()) {
          const index = tokenList.findIndex((value) => value.contractAddress.toLowerCase() == add)
          if (index == -1) {
            tokenList.push({
              name: name,
              decimals: decimal,
              symbol: symbol,
              contractAddress: add,
              balance: balance,
              usdBalance: 0,
              network: network,
              price: 0,
              holdersCount: 0,
              image: "",
              owner: "",
              totalSupply: 0,
              marketCap: "",
              pinSetting: false
            });
            address_str += add;
            address_str += "%2C";
          } else {
            tokenList[index].balance += balance;
          }
        } else {
          const index = tokenList.findIndex((value) => value.contractAddress.toLowerCase() == add)
          if (index != -1) {
            tokenList[index].balance -= balance;
          }
        }
      }
    }
    address_str = address_str.slice(0, -3);
    const tokenPrices = await getTokenPricefromCoingeckoAPI(address_str, constant.BINANCE_NETOWRK);
    if (tokenPrices != undefined) {
      tokenList.forEach((value, _index) => {
        const add = value.contractAddress;
        if (tokenPrices.hasOwnProperty(add)) {
          const bal = tokenPrices[value.contractAddress].usd * value.balance;
          value.usdBalance = bal;
        } else {
          value.usdBalance = 0;
        }
      })
    }

    tokenList.push(bnbToken);
    tokenList = tokenList.sort((value1, value2) => value2.usdBalance - value1.usdBalance);
    return tokenList;
  }

}


export async function getTokenInfoFromWalletAddress(address:string) {

  const url = ETH_MAINNET_PLORER_API_URL + 
    "getTokenInfo/" + 
    address + 
    "?apiKey=" + 
    ETHPLORER_API_KEY;
  let text: string;
  const response = await fetch(url);
  if (response.status != 200) {
    return constant.NOT_FOUND_TOKEN;
  }
  try {
    text = await response.text();
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }
  return JSON.parse(text);

}

export async function getTokenInfoFromTokenName(_name: string) {
  const url = "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
  const response = await fetch(url, {
    method: 'POST',
    headers: {'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY}
  });
  
  console.log('response', response.body);
  if (!response.ok) { /* Handle */ }
  
  // If you care about a response:
  if (response.body !== null) {
    console.log('response', response.body);
    // const asString = new TextDecoder("utf-8").decode(response.body);
    // const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
  }

  // const token = getTokenInfoBySymbol(name);
  // console.log('token', token);
  return constant.NOT_FOUND_TOKEN;
}

export async function getTokenSymbol(address: string, network: number) {

  let name, symbol, decimal, totalSupply;
  let TokenContract:ethers.Contract;
  if (network == constant.ETHEREUM_NETWORK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.ETHRPC_URL, constant.ETHEREUM_NETWORK);
    const signer = new ethers.Wallet(constant.WALLET_PRIVATE_KEY, provider);
    TokenContract = new ethers.Contract(address, ERC20TokenABI, signer)
  } else if (network == constant.BINANCE_NETOWRK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
    const signer = new ethers.Wallet(constant.WALLET_PRIVATE_KEY, provider);
    TokenContract = new ethers.Contract(address, BEP20TokenABI, signer)
  }
  try {
    decimal = await TokenContract!.decimals()
    symbol = await TokenContract!.symbol()
    name = await TokenContract!.name()
    totalSupply = await TokenContract!.totalSupply()
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }
  return [name, symbol, decimal, parseInt(totalSupply)/Math.pow(10, decimal)];
}

const getTokenId = async (address: string): Promise<string[] | undefined> => {
  const response = await fetch(`${CMC_ENDPOINT}${address}`)

  if (response.ok) {
    const obj = await response.json();
    return [obj.data.id, obj.data.symbol]
  }
  return undefined
}

export async function getTokenLogoURL(address: string, network:number, symbol: string) {
  const eth_default_url = "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png";
  const bnb_default_url = "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";
  const res = await getTokenId(address);
  if (res != undefined) {
    const id = res[0];
    const api_symbol = res[1];
    if (id != undefined && api_symbol.toLowerCase() == symbol.toLowerCase()) {
      const url = "https://s2.coinmarketcap.com/static/img/coins/64x64/" + id + ".png";
      return url;
    }
  }
  return network == constant.ETHEREUM_NETWORK ? eth_default_url : bnb_default_url;
}


export async function getTokenInfofromCoingeckoAPI(address: string, network: string) {
  const url = CG_ENDPOINT + "coins/" + network + "/contract/" + address;
  const response = await fetch(url)
  if (response.ok) {
    const obj = await response.json();
    return obj
  }
  return undefined  
}

export async function getTokenPricefromCoingeckoAPI(addresses: string, network: number) {
  const networkId = network == constant.ETHEREUM_NETWORK ? "ethereum" : "binance-smart-chain";
  const url = CG_ENDPOINT + "simple/token_price/" + networkId + "?contract_addresses=" + addresses + "&vs_currencies=USD";
  const response = await fetch(url)
  if (response.ok) {
    const obj = await response.json();
    return obj
  }
  return undefined    
}

export async function getLPTokenList(address: string, network: number, tokenside: number): Promise<LPTokenPair[]> {
      
  let response;
  let checkTokenList: string[] = [];
  let lpTokenList: LPTokenPair[] = [];

  response = await getLPPairs(address, network);
  if (response != constant.NOT_FOUND_TOKEN && response != null) {
    response.forEach((value:any) => {
        lpTokenList.push({
          name:  value.baseCurrency.symbol + "/" + value.quoteCurrency.symbol,
          symbol: value.baseCurrency.symbol + "/" + value.quoteCurrency.symbol,
          contractAddress: value.smartContract.address.address,
          price: 0,
          marketCap: "",
          totalSupply: 0,
          holdersCount: 0,
          balance: 0,
          decimals: 18,
          image: "",
          network: network,
          token0_reserve: 0,
          token1_reserve: 0,
          usdBalance: 0,
          owner: "",
          pinSetting: false,
          tokenside: tokenside,
          ownerToken: address,
          baseCurrency_name: value.baseCurrency.symbol,
          baseCurrency_decimals: value.baseCurrency.decimals,
          baseCurrency_contractAddress: value.baseCurrency.address,
          quoteCurrency_decimals: value.quoteCurrency.decimals,
          quoteCurrency_name: value.quoteCurrency.symbol,
          quoteCurrency_contractAddress: value.quoteCurrency.address,
          protocolType: value.smartContract.protocolType,
        } as LPTokenPair);
    });
  }
  // const url = network == constant.ETHEREUM_NETWORK ? SH_PAIRS : PC_PAIRS;
  // if(network == constant.ETHEREUM_NETWORK) {
  //   checkTokenList.push(constant.WHITELIST_TOKENS.ETH.USDC.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.ETH.USDT.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.ETH.ETH.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.ETH.DAI.toLowerCase());
  // } else {
  //   checkTokenList.push(constant.WHITELIST_TOKENS.BSC.USDC.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.BSC.USDT.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.BSC.BNB.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.BSC.BUSD.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.BSC.DAI.toLowerCase());
  //   checkTokenList.push(constant.WHITELIST_TOKENS.BSC.CAKE.toLowerCase());
  // }
  // if (tokenside == TokenSide.token0) {
  //   response = await request(url,
  //     gql`
  //     query getLPTokenPairs($address:String){
  //       pairs(where:{token0:$address}) {
  //         id
  //         token0 {
  //           id
  //           symbol
  //           decimals
  //         }
  //         token1 {
  //           id
  //           symbol
  //           decimals
  //         }
  //       }
  //     }
  //     `,
  //     {
  //       address
  //     }
  //   );
  // } else {
  //   response = await request(url,
  //     gql`
  //     query getLPTokenPairs($address:String){
  //       pairs(where:{token1:$address}) {
  //         id
  //         token0 {
  //           id
  //           symbol
  //           decimals
  //         }
  //         token1 {
  //           id
  //           symbol
  //           decimals
  //         }
  //       }
  //     }
  //     `,
  //     {
  //       address
  //     }
  //   );    
  // }
  // if (response != undefined && response.pairs.length > 0) {
  //   response.pairs.forEach((token: any) => {
  //     const token0 = token.token0.id;
  //     const token1 = token.token1.id;
  //     if ( (tokenside == TokenSide.token0 && checkTokenList.includes(token1.toLowerCase())) ||
  //          (tokenside == TokenSide.token1 && checkTokenList.includes(token0.toLowerCase()) )
  //     ) {
  //       lpTokenList.push({
  //         name:  token.token0.symbol + "/" + token.token1.symbol,
  //         symbol: token.token0.symbol + "/" + token.token1.symbol,
  //         contractAddress: token.id,
  //         price: 0,
  //         marketCap: "",
  //         totalSupply: 0,
  //         holdersCount: 0,
  //         balance: 0,
  //         decimals: 18,
  //         image: "",
  //         network: network,
  //         token0_name: token.token0.symbol,
  //         token1_name: token.token1.symbol,
  //         token0_reserve: 0,
  //         token1_reserve: 0,
  //         token0_contractAddress: token.token0.id,
  //         token1_contractAddress: token.token1.id,
  //         usdBalance: 0,
  //         owner: "",
  //         pinSetting: false,
  //         tokenside: tokenside,
  //         ownerToken: address,
  //         token0_decimal: token.token0.decimals,
  //         token1_decimal: token.token1.decimals,
  //       } as LPTokenPair);
  //     }
  //   });
  // }
  return lpTokenList;
}

export async function getLPTokenReserve(address: string, network: number) {

  let PairContractHttp;
  if (network == constant.ETHEREUM_NETWORK) {
    const web3Http = new Web3(constant.ETHRPC_URL);
    PairContractHttp = new web3Http.eth.Contract(
      UniswapV2Pair as AbiItem[],
      address
    );   
  } else {
    const web3Http = new Web3(constant.BSCRPC_URL);
    PairContractHttp = new web3Http.eth.Contract(
      PancakeswapV2Pair as AbiItem[],
      address
    );       
  }
  const _reserves = await PairContractHttp.methods.getReserves().call();
  const _factory = await PairContractHttp.methods.factory().call();
  const token0 = await PairContractHttp.methods.token0().call();
  const token1 = await PairContractHttp.methods.token1().call();
  // return data in Big Number
  return [parseInt(_reserves._reserve0), 
          parseInt(_reserves._reserve1),
          _factory,
          token0, token1];
}

export async function getTokenPricefromllama(address: string, network: number) {
  const networkId = network == constant.ETHEREUM_NETWORK ? "ethereum" : "bsc";
  const param = networkId + ":" + address;
  const url = LLAMA_ENDPOINT + "prices/current/" + param;
  const response = await fetch(url)
  try {
    const obj = await response.json();
    const price = obj.coins[param]["price"];
    return price
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }
}

export async function getMultiTokenPricefromllama(tokenList:ERC20Token[]){

  let param = "";
  tokenList.forEach((value) => {
    const networkId = value.network == constant.ETHEREUM_NETWORK ? "ethereum" : "bsc";
    param += networkId;
    param += ":";
    param += value.contractAddress;
    param += ",";
  })

  const url = LLAMA_ENDPOINT + "prices/current/" + param;
  try {
    const response = await fetch(url)
    const obj = await response.json();
    tokenList.forEach((value, index) => {
      const networkId = value.network == constant.ETHEREUM_NETWORK ? "ethereum" : "bsc";
      param = networkId + ":" + value.contractAddress;
      const price = obj.coins[param]["price"];
      value.price = price;
      return value;
    });
    return tokenList;
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }  
}