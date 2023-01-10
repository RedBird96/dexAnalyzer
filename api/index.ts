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
import {
  getHoldTokenList, 
  getTransferCount, 
  getLPPairs, 
  getBuySellTransactions
} from "./bitquery_graphql";
import * as constant from '../utils/constant'
import * as endpoint from '../utils/endpoints'
import { makeTemplateDate } from "../utils";

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
    const BSCLINK = " https://bscscan.com/address/";
    const bnbPrice = await getTokenPricefromllama(constant.WHITELIST_TOKENS.BSC.BNB, constant.BINANCE_NETOWRK);
    const usdBalance = bnbPrice * bnbBalance;
    let bnbToken:ERC20Token = {
      name: "BNB",
      decimals: 18,
      symbol: "BNB",
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
      pinSetting: false,
      contractPage: BSCLINK + constant.WHITELIST_TOKENS.BSC.BNB 
    }               
    let tokenList:ERC20Token[] = [];
    const eth = new EtherscanClient(BSC_MAINNET_CONNECTION);
    const res = await getHoldTokenList(address, network);
    let address_str = "";
    let addressurl_array:any[] = [];
    let addressurl_index = 0;
    if (res == constant.NOT_FOUND_TOKEN)
      return tokenList;
    for(let ind = 0; ind < res.length; ind ++) {

      if(res[ind].currency.tokenType == "ERC20" && res[ind].value > 0) {
        tokenList.push({
          name: res[ind].currency.name,
          decimals: res[ind].currency.decimals,
          symbol: res[ind].currency.symbol,
          contractAddress: res[ind].currency.address,
          balance: res[ind].value,
          usdBalance: 0,
          network: network,
          price: 0,
          holdersCount: 0,
          image: "",
          owner: "",
          totalSupply: 0,
          marketCap: "",
          pinSetting: false,
          contractPage: BSCLINK + res[ind].currency.address
        } as ERC20Token);
        if (ind != 0 && (ind % 150 == 0 || ind == res.length - 1)) {
          address_str = address_str.slice(0, -3);
          addressurl_array[addressurl_index] = address_str;
          addressurl_index ++;
          address_str = "";
        }
        address_str += res[ind].currency.address;
        address_str += "%2C";
      }
    }
    let jsonObject:any = {};
    for (let ind = 0; ind < addressurl_array.length; ind ++) {
      const price = await getTokenPricefromCoingeckoAPI(addressurl_array[ind], constant.BINANCE_NETOWRK);
      if (price != undefined && price != null) {
        Object.assign(jsonObject, price);
      }
    }
    tokenList.forEach((value, _index) => {
      const add = value.contractAddress;
      if (jsonObject.hasOwnProperty(add) && value.balance > 0) {
        const bal = jsonObject[value.contractAddress].usd * value.balance;
        value.usdBalance = bal;
      } else {
        value.usdBalance = 0;
      }
    })

    tokenList.push(bnbToken);
    tokenList = tokenList.sort((value1, value2) => value2.usdBalance - value1.usdBalance);
    return tokenList;
  }

}

export async function getTokenBurnAmount(address:string, network: number) {
  let client;
  if (network == constant.BINANCE_NETOWRK)
    client =  new EtherscanClient(BSC_MAINNET_CONNECTION);
  else
    client =  new EtherscanClient(ETH_MAINNET_CONNECTION);
  const deadAddress = "0x000000000000000000000000000000000000dead";
  const res = await client.call(Action.account_tokentx, {
    contractaddress:address,
    address:deadAddress
  });
  try {
    const value = res.result[0].value;
    const decimal = res.result[0].tokenDecimal;
    return (value / Math.pow(10, decimal));
  }catch{

  }
  return 0;
}

export async function getCurrentBlockNumber(network: number) {
  const provider = new ethers.providers.JsonRpcProvider(network == constant.ETHEREUM_NETWORK ? constant.ETHRPC_URL : constant.BSCRPC_URL);
  const blockNumber = await provider.getBlockNumber();
  return blockNumber;

}

export async function getLastTransactionsLogsByTopic(address:string, network: number) {
  
  const backTime = 1800;
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

export async function getTokenTransactionCount(address:string, network: number) {

  const response = await getTransferCount(address, network);
  if (response != constant.NOT_FOUND_TOKEN) {
    try{
      const transfercnt = response[0].countBigInt;
      return transfercnt;
    }catch {

    }
  }
  return 0;
}

export async function getTokenHolderCount(address:string, network: number) {

  // const LIMIT_COUNT = 10000;
  // let holderCount = 0;
  // try{
  //   for(let index = 0; index < LIMIT_COUNT; index ++) {
  //     const response = await getTokenHolder(address, network, LIMIT_COUNT, index * LIMIT_COUNT);
  //     if (response != constant.NOT_FOUND_TOKEN) {
  //         if (response.length == 0)
  //           break;
  //         response.forEach((value:any) => {
  //           if (value.receiver.smartContract.contractType == null)
  //             holderCount ++;
  //         })
  //     }
  //   }
  //   return holderCount;
  // } catch {

  // }
  // return 0;

  const response = await getTransferCount(address, network);
  if (response != constant.NOT_FOUND_TOKEN) {
    try{
      const transfercnt = response[0].count;
      return transfercnt;
    }catch {

    }
  }
  return 0;  
}

export async function getTokenInfoFromTokenName() {
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=1";
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
    console.log('social response', obj);
    let website = "", facebook = "", twitter = "", discord="", github = "", telegram = "", instagram = "", medium = "", reddit = "";

    try{
      if (obj["links"].hasOwnProperty('homepage')) {
        website = obj["links"].homepage[0];
        twitter= obj["links"].twitter_screen_name;
        facebook = obj["links"].facebook_username;
        discord = obj["links"].official_forum_url[0];
        github = obj["links"].repos_url.github[0];
        telegram = obj["links"].telegram_channel_identifier;
        medium = obj["links"].chat_url[2];
        reddit = obj["links"].subreddit_url;
      }
      if (twitter != "") {
        twitter = "https://twitter.com/" + twitter;
      }
      if (facebook != "") {
        facebook = "https://www.facebook.com/" + facebook;
      }
      if (telegram != "") {
        telegram = "https://t.me/" + telegram;
      }
      return [website, twitter, facebook, discord, github, telegram, instagram, medium, reddit]
    }
    catch {
      return ["","","","","","","","", ""]
    }
  }
  return ["","","","","","","","", ""]
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
          name:  value.baseCurrency.symbol + " / " + value.quoteCurrency.symbol,
          symbol: value.baseCurrency.symbol + " / " + value.quoteCurrency.symbol,
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

export async function getLPTransactionListFromWallet(address:string, tokenAddress: string, network: number, resolution:number) {
 
  const res = await getBuySellTransactions(address, network == constant.ETHEREUM_NETWORK ? constant.UNISWAP_ROUTER.v2 : constant.PANCAKESWAP_ROUTER.v2 ,network, tokenAddress);

  if (res == constant.NOT_FOUND_TOKEN) 
    return constant.NOT_FOUND_TOKEN;
  let array:any[] = [];
  if (res.length != 0 ) {
    res.forEach((value:any) => {
      const time = new Date(value["timeInterval"].second + " UTC");
      const cuTime = makeTemplateDate(time, resolution);
      if (value["buyCurrency"].address == tokenAddress) {
        array.push({
          intervalTime:cuTime.getTime(),
          time:time.getTime(),
          buy_sell:"sell",
          amount:value["baseAmount"]
        })
      } else {
        array.push({
          intervalTime:cuTime.getTime(),
          time:time.getTime(),
          buy_sell:"buy",
          amount:value["baseAmount"]
        })
      }
    });
  }
  
  array = array.sort((value1:any, value2:any) => {
    return value1.time - value2.time
  })
  return array;
}

export async function getTokenBalance(tokenAddress:string, walletAdderss:string, network:number) {
  
  let provider;
  let TokenContract:any;
  let balance, decimal ;
  if (network == constant.ETHEREUM_NETWORK) {
    provider = new ethers.providers.JsonRpcProvider(constant.ETHRPC_URL, constant.ETHEREUM_NETWORK);
    TokenContract = new ethers.Contract(tokenAddress == "NATIVE" ? walletAdderss : tokenAddress, ERC20TokenABI, provider)
  } else if (network == constant.BINANCE_NETOWRK) {
    provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
    TokenContract = new ethers.Contract(tokenAddress == "NATIVE" ? walletAdderss : tokenAddress, BEP20TokenABI, provider)
  }
  try {
    if (tokenAddress == "NATIVE") {
      balance = await provider.getBalance(walletAdderss);
      decimal = 18;
    } else {
      decimal = await TokenContract.decimals();
      balance = await TokenContract.balanceOf(walletAdderss);
    }
    return ethers.utils.formatUnits(balance, decimal);
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }

}