import EtherscanClient, {Action} from './ethers/etherscan-client';
import { CoinGeckoClient } from './CoinGeckoClient';
import fetch from 'cross-fetch';

const ETH_MAINNET_API_URL = 'https://api.etherscan.io/api';
const BNB_MAINNET_API_URL = 'https://api.bscscan.com/api';
const ETH_MAINNET_PLORER_API_URL = 'https://api.ethplorer.io/';
const ETHPLORER_API_KEY = 'EK-32KDR-3MoJfLq-QoUAU';
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
  console.log('url', url);
  let text: string;
  const response = await fetch(url);
  if (response.status != 200) {
    return "No results found";
  }
  try {
    text = await response.text();
  } catch (err:any) {
    return "No results found";
  }
  return JSON.parse(text);

}


export async function getTokenInfoFromWalletAddress(address:string) {

  const url = ETH_MAINNET_PLORER_API_URL + 
    "getTokenInfo/" + 
    address + 
    "?apiKey=" + 
    ETHPLORER_API_KEY;
  console.log('url', url);
  let text: string;
  const response = await fetch(url);
  if (response.status != 200) {
    return "No results found";
  }
  try {
    text = await response.text();
  } catch (err:any) {
    return "No results found";
  }
  return JSON.parse(text);

}

export async function getTokenInfoFromTokenName(name: string) {
  const client = new CoinGeckoClient();
  // const list = await client.coinList({ include_platform: true });
  const list = await client.coinMarket({
    vs_currency: "usd",
    ids: "bitcoin",
  }); 
  console.log('list', list);
}