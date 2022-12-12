import { ethers } from "ethers";
import { request, gql } from 'graphql-request';
import fetch from 'cross-fetch';
import web3 from 'web3';
import ERC20TokenABI from '../config/ERC20ABI.json'
import BEP20TokenABI from '../config/ERC20ABI.json'
import EtherscanClient, {Action} from './ethers/etherscan-client';
import {ERC20Token} from '../utils/type'
import * as constant from '../utils/constant'
import { createClient, useQuery } from 'urql'

const ETH_MAINNET_API_URL = 'https://api.etherscan.io/api';
const BSC_MAINNET_API_URL = 'https://api.bscscan.com/api';
const ETH_MAINNET_PLORER_API_URL = 'https://api.ethplorer.io/';
const ETHPLORER_API_KEY = 'EK-32KDR-3MoJfLq-QoUAU';
const COINMARKETCAP_API_KEY = 'd27ab07a-3853-4402-8d56-651767ba4da5';
const ETH_MAINNET_CONNECTION = {
  apiKey: 'DF8U1AYKKAW8NHQQJ2H34W6B49H38JI9SU',
  apiUrl: ETH_MAINNET_API_URL
};
const BSC_MAINNET_CONNECTION = {
  apiKey: '9JXFSN6Y82GSADZZRHHNDD29AMYFMB7XYS',
  apiUrl: BSC_MAINNET_API_URL
}
const CMC_ENDPOINT = 'https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/contract?address='
const CG_ENDPOINT = 'https://api.coingecko.com/api/v3/';
const PC_PAIRS = "https://api.thegraph.com/subgraphs/name/pancakeswap/pairs";

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
    const web3_bsc = new web3(constant.BSCRPC_URL);
    const bnbBalance = parseInt(await web3_bsc.eth.getBalance(address))/ Math.pow(10, 18);
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
              network: 0,
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

export async function getLPTokenList(address: string, network: number) {
      
  let lpTokenSymbol: string[] = [];
  let lpTokenAddresses: string[] = [];
  let checkTokenList: string[] = [];
  if(network == constant.ETHEREUM_NETWORK) {
    checkTokenList.push(constant.WHITELIST_TOKENS.ETH.USDC);
    checkTokenList.push(constant.WHITELIST_TOKENS.ETH.USDT);
    checkTokenList.push(constant.WHITELIST_TOKENS.ETH.ETH);
    checkTokenList.push(constant.WHITELIST_TOKENS.ETH.DAI);
  } else {
    checkTokenList.push(constant.WHITELIST_TOKENS.BSC.USDC);
    checkTokenList.push(constant.WHITELIST_TOKENS.BSC.USDT);
    checkTokenList.push(constant.WHITELIST_TOKENS.BSC.BNB);
    checkTokenList.push(constant.WHITELIST_TOKENS.BSC.BUSD);
    checkTokenList.push(constant.WHITELIST_TOKENS.BSC.DAI);
    checkTokenList.push(constant.WHITELIST_TOKENS.BSC.WBNB);
  }
  const response = await request(PC_PAIRS,
    gql`
    query getLPTokenPairs($address:String){
      pairs(where:{token1:$address}) {
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
    `,
    {
      address
    }
  );
  if (response != undefined && response.pairs.length > 0) {
    response.pairs.forEach((token: any) => {
      const token0 = token.token0.id;
      if (checkTokenList.includes(token0)) {
        lpTokenAddresses.push(token.id);
        lpTokenSymbol.push(token.token0.symbol + "/" + token.token1.symbol);
      }
    });
  }
  return [lpTokenAddresses, lpTokenSymbol];
}