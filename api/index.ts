import {getTokenInfoBySymbol} from '@akroma-project/akroma-erc20-token-list'
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
  } catch (err:any) {
    return constant.NOT_FOUND_TOKEN;
  }
  return JSON.parse(text);

}

export async function getTokenInfoFromTokenName(name: string) {
  const url = "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
  // const response = await fetch(url, {
  //   method: 'POST',
  //   headers: {'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY}
  // });
  
  // if (!response.ok) { /* Handle */ }
  
  // // If you care about a response:
  // if (response.body !== null) {
  //   console.log('response', response.body);
  //   // const asString = new TextDecoder("utf-8").decode(response.body);
  //   // const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
  // }

  // const token = getTokenInfoBySymbol(name);
  // console.log('token', token);
  return constant.NOT_FOUND_TOKEN;
}