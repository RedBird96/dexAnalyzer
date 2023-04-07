import { ethers } from "ethers";
import fetch from 'cross-fetch';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'
import ERC20TokenABI from '../config/ERC20ABI.json'
import BEP20TokenABI from '../config/ERC20ABI.json'
import EtherscanClient, {Action} from './ethers/etherscan-client';
import {ERC20Token, LPTokenPair, TokenSide, TransactionType} from '../utils/type'
import SRGToken from '../config/SRGToken.json';
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import {
  getHoldTokenList, 
  getTransferCount, 
  getLPPairs
} from "./bitquery_graphql";
import * as constant from '../utils/constant'
import * as endpoint from '../utils/endpoints'
import { makeTemplateDate } from "../utils";
import { 
  NODEREAL_BSC_API_KEY, 
  NODEREAL_ETH_API_KEY, 
  NODREAL_BSC_ENDPOINT, 
  NODREAL_ETH_ENDPOINT 
} from "../utils/endpoints";
import { Call, multicallv2 } from "../utils/multicall";

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

export async function getCurrentBlockTimestamp(network: number) {

  const provider = new ethers.providers.JsonRpcProvider(network == constant.ETHEREUM_NETWORK ? constant.ETHRPC_URL : constant.BSCRPC_URL);
  const blockNumber = await provider.getBlockNumber();
  const timestamp = (await provider.getBlock(blockNumber)).timestamp;
  return timestamp;
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

export async function getSRGBuySellTransactions(address:string, network:number, fromBlock: number) {

  const backTime = 36000;
  let tempTransaction: TransactionType[] = [];
  let txArr:any[] = [];
  let client, response_buy, response_sell;
  if (network == constant.ETHEREUM_NETWORK) {
    client = new EtherscanClient(ETH_MAINNET_CONNECTION);
  } else if (network == constant.BINANCE_NETOWRK) {
    client = new EtherscanClient(BSC_MAINNET_CONNECTION);
  }

  try{
    const blockCount = network == constant.ETHEREUM_NETWORK ? backTime / 12 : backTime / 3;
    const buyTopic = "0x7ce543d1780f3bdc3dac42da06c95da802653cd1b212b8d74ec3e3c33ad7095c";
    const sellTopic = "0x9be8a5ca22b7e6e81f04b5879f0248227bb770114291bd47dfaee4c3a82ad60e";
    response_buy = await client.call(Action.logs_getLogs, {
      fromBlock:fromBlock - blockCount,
      toBlock:'latest',
      topic0: buyTopic,
      address:address
    });
    response_sell = await client.call(Action.logs_getLogs, {
      fromBlock:fromBlock - blockCount, 
      toBlock:'latest',
      topic0: sellTopic,
      address:address
    });    

    const regex = new RegExp("^0+(?!$)",'g');

    if (response_buy.message == "OK" && response_buy.result.length > 0) {
      response_buy.result.forEach((value:any, index:number) => {
            
        const timeStamp = parseInt(value.timeStamp, 16);
        const time = new Date(timeStamp * 1000).toISOString();
        let param_data = value.data;
        param_data = param_data.slice(2, param_data.length);
        let datas:string[] = param_data.split(/(.{64})/).filter((O: any)=>O)
        datas[0] = datas[0].replaceAll(regex, "");
        datas[1] = datas[1].replaceAll(regex, "");
        datas[2] = datas[2].replaceAll(regex, "");

        const transaction_hash = value.transactionHash;
        const tokens = parseInt(datas[0], 16) / Math.pow(10, 9);
        const beans = parseInt(datas[1], 16) / Math.pow(10, 18);
        const dollarBuy = parseInt(datas[2], 16) / Math.pow(10, 24);
        
        const item = {
          buy_sell: "Buy",
          baseToken_amount: tokens,
          quoteToken_amount: beans,
          quoteToken_symbol: network == constant.ETHEREUM_NETWORK ? "WETH" : "WBNB",
          transaction_hash: transaction_hash,
          transaction_local_time: time.replace('T', ' ').slice(0, 19),
          transaction_utc_time: time,
        } as TransactionType;

        tempTransaction.push(item);

      });
    }

    if (response_sell.message == "OK" && response_sell.result.length > 0) {
      response_sell.result.forEach((value:any, index:number) => {
            
        const timeStamp = parseInt(value.timeStamp, 16);
        const time = new Date(timeStamp * 1000).toISOString();
        let param_data = value.data;
        param_data = param_data.slice(2, param_data.length);
        let datas:string[] = param_data.split(/(.{64})/).filter((O: any)=>O)
        datas[0] = datas[0].replaceAll(regex, "");
        datas[1] = datas[1].replaceAll(regex, "");
        datas[2] = datas[2].replaceAll(regex, "");

        const transaction_hash = value.transactionHash;
        const tokens = parseInt(datas[0], 16) / Math.pow(10, 9);
        const beans = parseInt(datas[1], 16) / Math.pow(10, 18);
        const dollarBuy = parseInt(datas[2], 16) / Math.pow(10, 24);
        
        const item = {
          buy_sell: "Sell",
          baseToken_amount: tokens,
          quoteToken_amount: beans,
          quoteToken_symbol: network == constant.ETHEREUM_NETWORK ? "WETH" : "WBNB",
          transaction_hash: transaction_hash,
          transaction_local_time: time.replace('T', ' ').slice(0, 19),
          transaction_utc_time: time,
        } as TransactionType;

        tempTransaction.push(item);

      });    

      tempTransaction = tempTransaction.sort((value1:TransactionType, value2:TransactionType) => {
        if (value1.transaction_local_time > value2.transaction_local_time){
          return -1;
        }
        return 1;
      })
    }

  } catch( e:any) {

  }

  // console.log('tempTransaction', tempTransaction);
  return tempTransaction;
}

export async function getTokenTransactionCount(address:string, network: number, tokenData:ERC20Token) {

  if (address.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ||
     address.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
      let TokenContract:ethers.Contract;
      if (network == constant.ETHEREUM_NETWORK) {
        const provider = new ethers.providers.JsonRpcProvider(constant.ETHRPC_URL, constant.ETHEREUM_NETWORK);
        TokenContract = new ethers.Contract(address, SRGToken , provider)
      } else if (network == constant.BINANCE_NETOWRK) {
        const provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
        TokenContract = new ethers.Contract(address, SRGToken, provider)
      }
    
      const resTx = await TokenContract!.totalTx();
      const txCount = parseInt(resTx._hex);
      return txCount;
  } else {
    const response = await getTransferCount(address, network, tokenData.controller?.signal);
    if (response != constant.NOT_FOUND_TOKEN) {
      try{
        const transfercnt = response[0].countBigInt;
        return transfercnt;
      }catch {

      }
    }
  }
  return 0;
}

export async function getTokenHolderCount(address:string, network: number) {

  let url = "";
  if (network == constant.ETHEREUM_NETWORK) {
    url = NODREAL_ETH_ENDPOINT + NODEREAL_ETH_API_KEY;
  } else {
    url = NODREAL_BSC_ENDPOINT + NODEREAL_BSC_API_KEY;
  }

  const data = {
    method: 'nr_getTokenHolderCount',
    params: [address],
    id: 1
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });

  try{
    if (response.ok) {
      const obj = await response.json();
      return parseInt(obj["result"].result, 16);
    }
  } catch(e) {
    
  }
  return 0;

}

export async function getTokenInfoFromTokenName() {
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=1";
  const response = await fetch(url, {
    method: 'POST',
    headers: {'X-CMC_PRO_API_KEY': endpoint.COINMARKETCAP_API_KEY}
  });
  
  if (!response.ok) { /* Handle */ }
  
  // If you care about a response:
  if (response.body !== null) {
    // const asString = new TextDecoder("utf-8").decode(response.body);
    // const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
  }

  // const token = getTokenInfoBySymbol(name);
  // console.log('token', token);
  return constant.NOT_FOUND_TOKEN;
}

export async function getTokenSymbol(address: string, network: number) {

  let name, symbol, decimal, totalSupply, txCount;
  let TokenContract:ethers.Contract;
  if (network == constant.ETHEREUM_NETWORK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.ETHRPC_URL, constant.ETHEREUM_NETWORK);
    TokenContract = new ethers.Contract(address, address.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ? SRGToken : ERC20TokenABI, provider)
  } else if (network == constant.BINANCE_NETOWRK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
    TokenContract = new ethers.Contract(address, address.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase() ? SRGToken : BEP20TokenABI, provider)
  }
  try {
    decimal = await TokenContract!.decimals()
    symbol = await TokenContract!.symbol()
    name = await TokenContract!.name()
    totalSupply = await TokenContract!.totalSupply()
    if (address.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() || address.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
      txCount = await TokenContract!.totalTx()
    }
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }
  return [name, symbol, decimal, parseInt(totalSupply)/Math.pow(10, decimal), parseInt(txCount?._hex)];
}

export async function getTokenTotalSupply(address:string, network: number, decimal: number) {
  
  let totalSupply;
  let TokenContract:ethers.Contract;
  if (network == constant.ETHEREUM_NETWORK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.ETHRPC_URL, constant.ETHEREUM_NETWORK);
    TokenContract = new ethers.Contract(address, ERC20TokenABI, provider)
  } else if (network == constant.BINANCE_NETOWRK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
    TokenContract = new ethers.Contract(address, BEP20TokenABI, provider)
  }
  try {
    totalSupply = await TokenContract!.totalSupply()
  } catch (err:any) {
    return 0;
  }
  return parseInt(totalSupply)/Math.pow(10, decimal);
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
    //console.log('social response', obj);
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

export async function getLPTokenList(address: string, network: number, tokenside: number, tokenData: ERC20Token): Promise<LPTokenPair[]> {
      
  let response;
  let lpTokenList: LPTokenPair[] = [];
  const NETWORKURL = network == constant.ETHEREUM_NETWORK ? 
    "https://etherscan.io/token/" :
    "https://bscscan.com/token/";
  response = await getLPPairs(address, network, tokenData.controller?.signal);
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
  if (address.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() || 
      address.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
    if (network == constant.ETHEREUM_NETWORK) {
      const web3Http = new Web3(constant.ETHRPC_URL);
      PairContractHttp = new web3Http.eth.Contract(
        SRGToken as AbiItem[],
        address
      );   
    } else {
      const web3Http = new Web3(constant.BSCRPC_URL);
      PairContractHttp = new web3Http.eth.Contract(
        SRGToken as AbiItem[],
        address
      );       
    }

    const liquidity = await PairContractHttp.methods.getLiquidity().call();
    return [0, liquidity / Math.pow(10, 18),"", "", ""];
  } else {
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

export async function getLPTransactionListFromWallet(
  address:string, 
  tokenAddress: string, 
  network: number, 
  resolution:number,
  decimal: number
) {
 
  let array:any[] = [];
  let client;
  if (network == constant.BINANCE_NETOWRK)
    client =  new EtherscanClient(BSC_MAINNET_CONNECTION);
  else
    client =  new EtherscanClient(ETH_MAINNET_CONNECTION);
  const res = await client.call(Action.account_tokentx, {
    contractaddress:tokenAddress,
    address:address,
    page:1,
    offset:0,
    startblock:0,
    endblock:'lastest',
    sort:'desc'
  });
  
  try {
    const response = res.result;
    if (response == undefined || response.length == 0)
      return constant.NOT_FOUND_TOKEN;
    
    response.forEach((value:any) => {
      let amount = value["value"];
      if (amount == 0)
        return;
        
      const time = new Date(parseInt(value["timeStamp"]) * 1000);
      const cuTime = makeTemplateDate(time, resolution);
      amount = amount / Math.pow(10, decimal);
      if (value["from"].toLowerCase() == address.toLowerCase()) {
        array.push({
          intervalTime:cuTime.getTime(),
          time:time.getTime(),
          buy_sell:"sell",
          amount:amount
        })          
      } else {
        array.push({
          intervalTime:cuTime.getTime(),
          time:time.getTime(),
          buy_sell:"buy",
          amount:amount
        })
      }
    })
    
  }catch{

  }

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

export async function getTokenByAddressOrName(tokenString:string, choose_network = 0) {

  let tokenArray:ERC20Token[] = [];
  let url = "";
  if (choose_network == 0) {
    url = `https://dolphin-app-5z4bf.ondigitalocean.app/get?url=https%3A%2F%2Fwww.dextools.io%2Fshared%2Fsearch%2Fv2%3Fchains%3Dbsc%2Cether%26query%3D${tokenString}%26type%3Dtoken`;
  } else if (choose_network == constant.ETHEREUM_NETWORK) {
    url = `https://dolphin-app-5z4bf.ondigitalocean.app/get?url=https%3A%2F%2Fwww.dextools.io%2Fshared%2Fsearch%2Fv2%3Fchains%3Dether%26query%3D${tokenString}%26type%3Dtoken`;
  } else if (choose_network == constant.BINANCE_NETOWRK) {
    url = `https://dolphin-app-5z4bf.ondigitalocean.app/get?url=https%3A%2F%2Fwww.dextools.io%2Fshared%2Fsearch%2Fv2%3Fchains%3Dbsc%26query%3D${tokenString}%26type%3Dtoken`;
  }
  const response = await fetch(url, {
    method: 'GET',
    headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
  });
  
  try{
    if (response.ok) {
      const obj = await response.json();
      const contents = JSON.parse(obj.contents);
      const results = contents["results"];
      if (results != undefined && results.length > 0) {
        for (const value of results) {
          if (value.id.chain == "bsc") {
            const address = value.id.token;
            const findItem = tokenArray.find((value) => 
              value.contractAddress.toLowerCase() == address.toLowerCase() && value.network == constant.BINANCE_NETOWRK);
            if (findItem != undefined)
              continue;
            const BSCLINK = " https://bscscan.com/";
            const name = value.token.name;
            const symbol = value.token.symbol;
            const decimal = value.token.decimals;
            let totalSupply = -1;
            let logo = "";
            let social = ["","","","","","","","", ""];
            if (value.token.totalSupply != undefined){
              totalSupply = parseInt(value.token.totalSupply) / Math.pow(10, decimal);
            } else {
              totalSupply = await getTokenTotalSupply(address, constant.BINANCE_NETOWRK, decimal);
            }
            if (value.token.logo != undefined) {
              logo = await getTokenLogoURL(address, constant.BINANCE_NETOWRK, symbol);
            } else {
              logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";
            }
            if (value.token.links != undefined) {
              social = await getTokenSocialInfofromCoingeckoAPI(address, constant.BINANCE_NETOWRK);            
            }
            tokenArray.push({
              name: name,
              contractAddress: address,
              price: 0,
              marketCap: "",
              totalSupply: totalSupply,
              holdersCount: 0,
              balance: 0,
              decimals: decimal,
              symbol: symbol,
              image: logo,
              txCount: 0,
              network: constant.BINANCE_NETOWRK,
              pinSetting: false,
              website: social![0],
              twitter: social![1],
              facebook: social![2],
              discord: social![3],
              github: social![4],
              telegram: social![5],
              instagra: social![6],
              medium: social![7],
              reddit: social![8],
              contractCodeURL: BSCLINK + "address/" + address +"#code",
              contractBalanceWalletURL: BSCLINK + "token/" + address + "?a=",
              contractBalanceURL: BSCLINK + "token/" + address + "#balances",
              contractPage:BSCLINK + "token/" + address
            } as ERC20Token);
          } else if (value.id.chain == "ether") {
            const address = value.id.token;
            const findItem = tokenArray.find((value) => 
              value.contractAddress.toLowerCase() == address.toLowerCase() && value.network == constant.ETHEREUM_NETWORK);
            if (findItem != undefined)
            continue;
            const ETHLINK = "  https://etherscan.io/";
            const name = value.token.name;
            const symbol = value.token.symbol;
            const decimal = parseInt(value.token.decimals);
            let totalSupply = -1;
            let logo = "";
            let social = ["","","","","","","","", ""];
            if (value.token.totalSupply != undefined){
              totalSupply = parseInt(value.token.totalSupply) / Math.pow(10, decimal);
            } else {
              totalSupply = await getTokenTotalSupply(address, constant.ETHEREUM_NETWORK, decimal);
            }
            if (value.token.logo != undefined) {
              logo = await getTokenLogoURL(address, constant.ETHEREUM_NETWORK, symbol);
            } else {
              logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png";
            }
            if (value.token.links != undefined) {
              social = await getTokenSocialInfofromCoingeckoAPI(address, constant.ETHEREUM_NETWORK);            
            }
            tokenArray.push({
              name: name,
              contractAddress: address,
              price: 0,
              marketCap: "",
              totalSupply: totalSupply,
              holdersCount: 0,
              balance: 0,
              decimals: decimal,
              symbol: symbol,
              image: logo,
              network: constant.ETHEREUM_NETWORK,
              pinSetting: false,
              website: social![0],
              twitter: social![1],
              facebook: social![2],
              discord: social![3],
              github: social![4],
              telegram: social![5],
              instagra: social![6],
              medium: social![7],
              reddit: social![8],
              contractCodeURL: ETHLINK + "address/" + address +"#code",
              contractBalanceWalletURL: ETHLINK + "token/" + address + "?a=",
              contractBalanceURL: ETHLINK + "token/" + address + "#balances",
              contractPage:ETHLINK + "token/" + address
            } as ERC20Token);
          }
        }
      }
    }
  } catch(e) {

  }
  return tokenArray;
}

export async function getSRGTimestamp(address:string, network:number) {
  
  let txCount = await getTokenTransactionCount(address, network, null);
  let reserveCalls: Call[] = [];
  let responseArr:any[] = [];
  const MAX_COUNT = 2000;
  let offset = 0;
  let count = 0;
  // console.log('getSRGTimestamp', txCount);
  while(count < txCount) {
    
    if (txCount <= MAX_COUNT) {
      count = txCount;
    } else {
      count += MAX_COUNT;
      if (count > txCount) {
        count = txCount;
      }
    }

    // console.log('while', offset, count);
    reserveCalls = [];
    for(let index = offset + 1; index <= count; index++) {
      reserveCalls.push({
        name: 'txTimeStamp',
        address: address,
        params: [index],
      })

    }
    const timeStampArr = await multicallv2(SRGToken, reserveCalls, network);  
    responseArr = responseArr.concat(timeStampArr);

    offset = count;
  }

  responseArr.forEach((value:any, index:number) => {
    responseArr[index] = parseInt(value[0]._hex, 16);
  })

  // console.log('responseArr', responseArr);
  return responseArr;


}
export async function getSRGTx(
  address:string, 
  network:number, 
  fromTimestamp:number, 
  toTimestamp:number, 
  txArray:any[]
):Promise<any[]> {

  let candleArray:any[] = [];
  let volumeArray:any[] = [];
  let reserveCalls: Call[] = [];
  const MAX_COUNT = 2000;
  let offset = 0;
  let count = 0;
  
  // console.log('from to timeStamp', fromTimestamp, toTimestamp);
  const fromIndex = txArray.findIndex((value:any) => value >= fromTimestamp);
  const toIndex = txArray.findLastIndex((value:any) => value <= toTimestamp);

  // console.log('from to Index', fromIndex, toIndex);
  while(count + fromIndex < toIndex) {

    if (toIndex - fromIndex <= MAX_COUNT) {
      count = toIndex - fromIndex + 1;
    } else {
      count += MAX_COUNT;
      if (count + fromIndex > toIndex) {
        count = toIndex - fromIndex + 1;
      }
    }

    // console.log('offset count', offset, count + fromIndex);
    reserveCalls = [];
    
    for(let index = fromIndex + offset; index < count + fromIndex; index++) {
      reserveCalls.push({
      name: 'candleStickData',
      address: address,
      params: [txArray[index]],
      })
    }
    // console.log('reserveCall', reserveCalls);
    const txArr = await multicallv2(SRGToken, reserveCalls, network);  
    // console.log('txArr', txArr);
    reserveCalls = [];
    for(let index = fromIndex + offset; index < count + fromIndex; index++) {
        reserveCalls.push({
        name: 'tVol',
        address: address,
        params: [txArray[index]],
        })
    }
    const volArr = await multicallv2(SRGToken, reserveCalls, network);   
    candleArray = candleArray.concat(txArr);
    volumeArray = volumeArray.concat(volArr);

    offset = count;
  }
  
  return [candleArray, volumeArray];

}

export async function getSRGTax(address:string, network: number, buySell: boolean):Promise<number> {
 
  let TokenContract:ethers.Contract;
  if (network == constant.ETHEREUM_NETWORK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.ETHRPC_URL, constant.ETHEREUM_NETWORK);
    TokenContract = new ethers.Contract(address, SRGToken , provider)
  } else if (network == constant.BINANCE_NETOWRK) {
    const provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
    TokenContract = new ethers.Contract(address, SRGToken, provider)
  }

  let fee = 0, resMul:any;
  if (buySell) { // buy
    resMul = await TokenContract!.buyMul();
  } else { //sell
    resMul = await TokenContract!.sellMul();
  }
  fee = parseInt(resMul._hex, 16) / 100;
  return fee;

}

export async function testTxHash(txhash:string, fromDecimal: number, toDecimal: number, price:number) {

  const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const DEPOSIT_TOPIC = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c";
  const web3Http = new Web3(constant.BSCRPC_URL); 
  const res  = await web3Http.eth.getTransactionReceipt(txhash);
  const logs = res.logs;
  const fromMaker = res.from;
  let fromAmount = 0;
  let toAmount = 0;
  logs.forEach((log) => {
    if (log.topics[0].toLowerCase() == TRANSFER_TOPIC.toLowerCase()) {
      const from = "0x" + log.topics[1].substring(26, log.topics[1].length);
      const to = "0x" + log.topics[2].substring(26, log.topics[1].length);
      if (from.toLowerCase() == fromMaker.toLowerCase()) {
        const value = parseFloat(ethers.utils.formatUnits(log.data, fromDecimal));
        fromAmount += value;
      }
      if (to.toLowerCase() == fromMaker.toLowerCase()) {
        const value = parseFloat(ethers.utils.formatUnits(log.data, toDecimal));
        toAmount += value;
      }
    }
  })
  const expectToAmount = fromAmount * price;
}

export async function getTaxPercentageStable(
  txhash:string, 
  network:number, 
  fromDecimal: number, 
  toDecimal: number, 
  price: number, 
  buy_sell:string,
  baseContract: string
) {

  let stableaddr = "";
  const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const DEPOSIT_TOPIC = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c";
  let web3Http;
  if (network == constant.ETHEREUM_NETWORK) {
    web3Http = new Web3(constant.ETHRPC_URL);
    stableaddr = constant.WHITELIST_TOKENS.ETH.ETH;
  } else {
    web3Http = new Web3(constant.BSCRPC_URL);
    stableaddr = constant.WHITELIST_TOKENS.BSC.BNB;
  }

  const txHashDetail = await web3Http.eth.getTransactionReceipt(txhash);
  try{
    const logs = txHashDetail.logs;
    const fromMaker = txHashDetail.from;
    let fromAmount = 0;
    let toAmount = 0;
    let desposited = false;
    logs.forEach((tx:any) => {
      if (buy_sell == "Buy") {
        if (tx.topics[0].toLowerCase() == DEPOSIT_TOPIC.toLowerCase()) {
          const value = parseFloat(ethers.utils.formatUnits(tx.data, fromDecimal));
          fromAmount = value;
          desposited = true;
        }
        if (tx.topics[0].toLowerCase() == TRANSFER_TOPIC.toLowerCase()) {
          if (tx.address.toLowerCase() == stableaddr.toLowerCase() && !desposited) {
            const value = parseFloat(ethers.utils.formatUnits(tx.data, fromDecimal));
            fromAmount += value;
          } else {
            const to = "0x" + tx.topics[2].substring(26, tx.topics[1].length);
            if (fromMaker.toLowerCase() == to.toLowerCase() && baseContract.toLowerCase() == tx.address.toLowerCase()) {
              const value = parseFloat(ethers.utils.formatUnits(tx.data, toDecimal));
              toAmount += value;
            }
          }
        }
      } else {
        if (tx.topics[0].toLowerCase() == TRANSFER_TOPIC.toLowerCase()) {
          const from = "0x" + tx.topics[1].substring(26, tx.topics[1].length);
          const to = "0x" + tx.topics[2].substring(26, tx.topics[1].length);
          if (fromMaker.toLowerCase() == from.toLowerCase() && baseContract.toLowerCase() == tx.address.toLowerCase()) {
            const value = parseFloat(ethers.utils.formatUnits(tx.data, fromDecimal));
            fromAmount += value;
          }
          if (tx.address.toLowerCase() == stableaddr.toLowerCase()) {
            const value = parseFloat(ethers.utils.formatUnits(tx.data, toDecimal));
            toAmount += value;
          }
        }
      }
    })

    let expectToAmount = fromAmount * price;
    if (buy_sell == "Buy")
      expectToAmount = fromAmount / price;
    let percent = (1 - (toAmount / expectToAmount)) * 100;
    if (percent < 0 || percent > 10 || expectToAmount == 0)
      percent = 10;
    return percent;

  } catch(e) {

  }
  return 10;
}

export async function getTaxPercentage(
  txhash:string, 
  network:number, 
  fromDecimal: number, 
  toDecimal: number, 
  price: number, 
  buy_sell:string,
  quoteContract:string,
  baseContract:string
) {
  
  const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  let web3Http;
  if (network == constant.ETHEREUM_NETWORK) {
    web3Http = new Web3(constant.ETHRPC_URL);
  } else {
    web3Http = new Web3(constant.BSCRPC_URL);
  }

  const txHashDetail = await web3Http.eth.getTransactionReceipt(txhash);
  try {
    const logs = txHashDetail.logs;
    const fromMaker = txHashDetail.from;
    let fromAmount = 0;
    let toAmount = 0;
    logs.forEach((log) => {
      if (log.topics[0].toLowerCase() == TRANSFER_TOPIC.toLowerCase()) {
        const from = "0x" + log.topics[1].substring(26, log.topics[1].length);
        const to = "0x" + log.topics[2].substring(26, log.topics[1].length);
        if (from.toLowerCase() == fromMaker.toLowerCase() && quoteContract.toLowerCase() == log.address.toLowerCase()) {
          const value = parseFloat(ethers.utils.formatUnits(log.data, fromDecimal));
          fromAmount += value;
        }
        if (to.toLowerCase().toLowerCase() == fromMaker.toLowerCase().toLowerCase() && baseContract.toLowerCase() == log.address.toLowerCase()) {
          const value = parseFloat(ethers.utils.formatUnits(log.data, toDecimal));
          toAmount += value;
        }
      }
    })
    let expectToAmount = fromAmount * price;
    if (buy_sell == "Buy")
      expectToAmount = fromAmount / price;
    let percent = (1 - (toAmount / expectToAmount)) * 100;
    if (percent < 0 || percent > 10 || expectToAmount == 0)
      percent = 10;
    return percent;
  } catch(e){

  }
  return 10;
}


export async function getBuySellTaxFromTx(
  transactionData: TransactionType[], 
  lpTokenInfo: LPTokenPair
) {

  let buyTax = 10, sellTax = 10;
  const firstTx = transactionData[0];
  const tokenSide = lpTokenInfo.tokenside;
  const isStablePair = lpTokenInfo.quoteCurrency_contractAddress?.toLowerCase() == constant.WHITELIST_TOKENS.ETH.ETH?.toLowerCase() || 
                       lpTokenInfo.quoteCurrency_contractAddress?.toLowerCase() == constant.WHITELIST_TOKENS.BSC.BNB?.toLowerCase() ? true : false;
  let calReserve0 = lpTokenInfo.token0_reserve;;
  let calReserve1 = lpTokenInfo.token1_reserve;;
  let prePrice = 0;

  if (firstTx.buy_sell == "Buy") {
    if (tokenSide == TokenSide.token0) {
      calReserve0 += firstTx.baseToken_amount;
      calReserve1 -= firstTx.quoteToken_amount;
      prePrice = calReserve1 / calReserve0;
    } else {
      calReserve0 += firstTx.quoteToken_amount;
      calReserve1 -= firstTx.baseToken_amount;
      prePrice = calReserve0 / calReserve1;
    }    
    let res;
    if (isStablePair)
      res = await getTaxPercentageStable(
        firstTx.transaction_hash, 
        lpTokenInfo.network, 
        lpTokenInfo.quoteCurrency_decimals, 
        lpTokenInfo.baseCurrency_decimals, 
        prePrice, 
        firstTx.buy_sell,
        lpTokenInfo.baseCurrency_contractAddress
      );
    else
      res = await getTaxPercentage(
        firstTx.transaction_hash, 
        lpTokenInfo.network, 
        lpTokenInfo.quoteCurrency_decimals, 
        lpTokenInfo.baseCurrency_decimals, 
        prePrice, 
        firstTx.buy_sell,
        lpTokenInfo.quoteCurrency_contractAddress,
        lpTokenInfo.baseCurrency_contractAddress
      );
    if (res != 0)
      buyTax = res;
  } else {
    if (tokenSide == TokenSide.token0) {
      calReserve0 -= firstTx.baseToken_amount;
      calReserve1 += firstTx.quoteToken_amount;
      prePrice = calReserve1 / calReserve0;
    } else {
      calReserve0 -= firstTx.quoteToken_amount;
      calReserve1 += firstTx.baseToken_amount;
      prePrice = calReserve0 / calReserve1;
    }
    let res;
    if (isStablePair)
      res = await getTaxPercentageStable(
        firstTx.transaction_hash, 
        lpTokenInfo.network, 
        lpTokenInfo.baseCurrency_decimals, 
        lpTokenInfo.quoteCurrency_decimals, 
        prePrice, 
        firstTx.buy_sell,
        lpTokenInfo.baseCurrency_contractAddress
      );
    else
      res = await getTaxPercentage(
        firstTx.transaction_hash, 
        lpTokenInfo.network, 
        lpTokenInfo.baseCurrency_decimals, 
        lpTokenInfo.quoteCurrency_decimals, 
        prePrice, 
        firstTx.buy_sell,
        lpTokenInfo.quoteCurrency_contractAddress,
        lpTokenInfo.baseCurrency_contractAddress
      );
    if (res != 0)
      sellTax = res;
  }

  for (let index = 1; index < transactionData.length; index ++) {
    const tx = transactionData[index];
    if (tx.buy_sell == "Buy") {
      if (tokenSide == TokenSide.token0) {
        calReserve0 += tx.baseToken_amount;
        calReserve1 -= tx.quoteToken_amount;
        prePrice = calReserve1 / calReserve0;
      } else {
        calReserve0 += tx.quoteToken_amount;
        calReserve1 -= tx.baseToken_amount;
        prePrice = calReserve0 / calReserve1;
      }   
      if (tx.buy_sell != firstTx.buy_sell) {
        let res;
        if (isStablePair)
          res = await getTaxPercentageStable(
            tx.transaction_hash, 
            lpTokenInfo.network, 
            lpTokenInfo.quoteCurrency_decimals, 
            lpTokenInfo.baseCurrency_decimals, 
            prePrice, 
            tx.buy_sell,
            lpTokenInfo.baseCurrency_contractAddress
          );
        else
          res = await getTaxPercentage(
            tx.transaction_hash, 
            lpTokenInfo.network, 
            lpTokenInfo.quoteCurrency_decimals, 
            lpTokenInfo.baseCurrency_decimals, 
            prePrice, 
            tx.buy_sell,
            lpTokenInfo.quoteCurrency_contractAddress,
            lpTokenInfo.baseCurrency_contractAddress
          );
        if (res != 0)
          buyTax = res;
        
        break;
      }
    } else {
      if (tokenSide == TokenSide.token0) {
        calReserve0 -= tx.baseToken_amount;
        calReserve1 += tx.quoteToken_amount;
        prePrice = calReserve1 / calReserve0;
      } else {
        calReserve0 -= tx.quoteToken_amount;
        calReserve1 += tx.baseToken_amount;
        prePrice = calReserve0 / calReserve1;
      }
      if (tx.buy_sell != firstTx.buy_sell) {
        let res;
        if (isStablePair)
          res = await getTaxPercentageStable(
            tx.transaction_hash, 
            lpTokenInfo.network, 
            lpTokenInfo.baseCurrency_decimals, 
            lpTokenInfo.quoteCurrency_decimals, 
            prePrice, 
            tx.buy_sell,
            lpTokenInfo.baseCurrency_contractAddress
          );
        else
          res = await getTaxPercentage(
            tx.transaction_hash, 
            lpTokenInfo.network,
            lpTokenInfo.baseCurrency_decimals, 
            lpTokenInfo.quoteCurrency_decimals, 
            prePrice, 
            tx.buy_sell,
            lpTokenInfo.quoteCurrency_contractAddress,
            lpTokenInfo.baseCurrency_contractAddress
          );
        if (res != 0)
          sellTax = res;

        break;
      }
    }
  }

  buyTax = Math.floor(buyTax);
  sellTax = Math.floor(sellTax);  
  return [buyTax, sellTax];
}