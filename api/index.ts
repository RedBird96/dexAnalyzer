import { ethers } from "ethers";
import { ChainId, Currency, CurrencyAmount, Native, Token, WNATIVE } from '@pancakeswap/sdk'
import ERC20TokenABI from '../config/ERC20ABI.json'
import BEP20TokenABI from '../config/ERC20ABI.json'
import EtherscanClient, {Action} from './ethers/etherscan-client';
import { CoinGeckoClient } from './CoinGeckoClient';
import * as constant from '../utils/constant'
import fetch from 'cross-fetch';

const ETH_MAINNET_API_URL = 'https://api.etherscan.io/api';
const BNB_MAINNET_API_URL = 'https://api.bscscan.com/api';
const ETH_MAINNET_PLORER_API_URL = 'https://api.ethplorer.io/';
const ETHPLORER_API_KEY = 'EK-32KDR-3MoJfLq-QoUAU';
const COINMARKETCAP_API_KEY = 'd27ab07a-3853-4402-8d56-651767ba4da5';
const MAINNET_CONNECTION = {
  apiKey: 'DF8U1AYKKAW8NHQQJ2H34W6B49H38JI9SU',
  apiUrl: ETH_MAINNET_API_URL
};
const CMC_ENDPOINT = 'https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/contract?address='

export async function getContractInfoFromWalletAddress(address:string) {

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
    console.log('text', text);
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }
  return JSON.parse(text);

}

export async function getTokenInfoFromTokenName(name: string) {
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


export function wrappedCurrency(chainId: ChainId | undefined): Token | undefined {
  return chainId && WNATIVE[chainId]
}

export async function getTokenSymbol(address: string, network: number) {

  let name, symbol;
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
    symbol = await TokenContract!.symbol()
    name = await TokenContract!.name()
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }
  return [name, symbol];
}

const getTokenId = async (address: string): Promise<string | undefined> => {
  const response = await fetch(`${CMC_ENDPOINT}${address}`)

  if (response.ok) {
    return (await response.json()).data.id
  }
  return undefined
}

export async function getTokenLogoURL(address: string, network:number) {
  const id = await getTokenId(address);
  const eth_default_url = "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png";
  const bnb_default_url = "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";
  if (id != undefined) {
    const url = "https://s2.coinmarketcap.com/static/img/coins/64x64/" + id + ".png";
    return url;
  }
  return network == constant.ETHEREUM_NETWORK ? eth_default_url : bnb_default_url;
}
