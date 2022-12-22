import { ethers } from "ethers";
import fetch from 'cross-fetch';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'
import ERC20TokenABI from '../config/ERC20ABI.json'
import BEP20TokenABI from '../config/ERC20ABI.json'
import EtherscanClient, {Action} from './ethers/etherscan-client';
import {ERC20Token, LPTokenPair, TokenSide} from '../utils/type'
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import { getHoldTransferCount, getLPPairs } from "./bitquery_graphql";
import * as constant from '../utils/constant'
import * as endpoint from '../utils/endpoints'

const ETH_MAINNET_CONNECTION = {
  apiKey: endpoint.ETHERSCAN_API_KEY,
  apiUrl: endpoint.ETH_MAINNET_API_URL
};
const BSC_MAINNET_CONNECTION = {
  apiKey: endpoint.BSCSCAN_API_KEY,
  apiUrl: endpoint.BSC_MAINNET_API_URL
}

export async function getContractInfoFromWalletAddress(address:string, network: number) {

  if (network == constant.ETHEREUM_NETWORK) {
    const url = endpoint.ETH_MAINNET_PLORER_API_URL + 
      "getAddressInfo/" + 
      address + 
      "?apiKey=" + 
      endpoint.ETHPLORER_API_KEY;
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

export async function getCurrentBlockNumber(network: number) {
  const provider = new ethers.providers.JsonRpcProvider(network == constant.ETHEREUM_NETWORK ? constant.ETHRPC_URL : constant.BSCRPC_URL);
  const blockNumber = await provider.getBlockNumber();
  return blockNumber;

}

export async function getLastTransactionsLogsByTopic(address:string, network: number) {
  
  const backTime = 3600;
  const topic = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
  let client, response;
  if (network == constant.ETHEREUM_NETWORK) {
    client = new EtherscanClient(ETH_MAINNET_CONNECTION);
  } else {
    client = new EtherscanClient(BSC_MAINNET_CONNECTION);
  }
  const blockCount = network == constant.ETHEREUM_NETWORK ? backTime / 12 : backTime / 3;
  const currentBlock = await getCurrentBlockNumber(network);
  response = await client.call(Action.logs_getLogs, {
    fromBlock:currentBlock - blockCount, 
    toBlock:'latest',
    topic0: topic,
    address:address
  });
  if (response.message == "OK") {
    return response.result;
  }

  return constant.NOT_FOUND_TOKEN;
}

export async function getTokenHolderandTransactionCount(address:string, network: number) {

  const response = await getHoldTransferCount(address, network);
  console.log('response', response);
  if (response != constant.NOT_FOUND_TOKEN) {
    try{
      const holder = response[0].count;
      const transfercnt = response[0].countBigInt;
      return [holder, transfercnt];
    }catch {

    }
  }
  return [0, 0];
}

export async function getTokenInfoFromTokenName(_name: string) {
  const url = "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
  const response = await fetch(url, {
    method: 'POST',
    headers: {'X-CMC_PRO_API_KEY': endpoint.COINMARKETCAP_API_KEY}
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
    TokenContract = new ethers.Contract(address, ERC20TokenABI, provider)
  } else if (network == constant.BINANCE_NETOWRK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
    TokenContract = new ethers.Contract(address, BEP20TokenABI, provider)
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
  const response = await fetch(`${endpoint.CMC_ENDPOINT}${address}`)

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


export async function getTokenSocialInfofromCoingeckoAPI(address: string, network: number) {
  const networkId = network == constant.ETHEREUM_NETWORK ? "ethereum" : "binance-smart-chain";
  const url = endpoint.CG_ENDPOINT + "coins/" + networkId + "/contract/" + address;
  const response = await fetch(url)
  if (response.ok) {
    const obj = await response.json();
    let website = "", facebook = "", twitter = "";
    try{
      if (obj["links"].hasOwnProperty('homepage')) {
        website = obj["links"].homepage[0];
        twitter= obj["links"].twitter_screen_name;
        facebook = obj["links"].facebook_username;
      }
      if (twitter != "") {
        twitter = "https://twitter.com/" + twitter;
      }
      if (facebook != "") {
        facebook = "https://www.facebook.com/" + facebook;
      }
      console.log('social', website, twitter, facebook);
      return [website, twitter, facebook]
    }
    catch {
      return ["","",""]
    }
  }
  return ["","",""]
}

export async function getTokenPricefromCoingeckoAPI(addresses: string, network: number) {
  const networkId = network == constant.ETHEREUM_NETWORK ? "ethereum" : "binance-smart-chain";
  const url = endpoint.CG_ENDPOINT + "simple/token_price/" + networkId + "?contract_addresses=" + addresses + "&vs_currencies=USD";
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
  const NETWORKURL = network == constant.ETHEREUM_NETWORK ? 
    "https://etherscan.io/token/" :
    "https://bscscan.com/token/";
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
          ownerToken: address.toLowerCase(),
          baseCurrency_name: value.baseCurrency.symbol,
          baseCurrency_decimals: value.baseCurrency.decimals,
          baseCurrency_contractAddress: value.baseCurrency.address,
          quoteCurrency_decimals: value.quoteCurrency.decimals,
          quoteCurrency_name: value.quoteCurrency.symbol,
          quoteCurrency_contractAddress: value.quoteCurrency.address,
          protocolType: value.smartContract.protocolType,
          pairContractURL: NETWORKURL + value.smartContract.address.address + "#balances"
        } as LPTokenPair);
    });
  }
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
  const url = endpoint.LLAMA_ENDPOINT + "prices/current/" + param;
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

  const url = endpoint.LLAMA_ENDPOINT + "prices/current/" + param;
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