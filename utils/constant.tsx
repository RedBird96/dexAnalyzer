export const NOT_FOUND_TOKEN = "No results found";
const PANCAKE_EXTENDED = 'https://tokens.pancakeswap.finance/pancakeswap-extended.json'
const COINGECKO = 'https://tokens.pancakeswap.finance/coingecko.json'
const CMC = 'https://tokens.pancakeswap.finance/cmc.json'

// List of official tokens list
export const OFFICIAL_LISTS = [PANCAKE_EXTENDED]

export const UNSUPPORTED_LIST_URLS: string[] = []
export const WARNING_LIST_URLS: string[] = []

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  PANCAKE_EXTENDED,
  CMC,
  COINGECKO,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
  ...WARNING_LIST_URLS,
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [PANCAKE_EXTENDED]

export const WALLET_PRIVATE_KEY = "9905e3751dfe01e7922e6a9cf85b7d47c4d25a37614ea16a6883213aea6c855b";
export const ETHEREUM_NETWORK = 1;
export const BINANCE_NETOWRK = 56;
export const ETHRPC_URL = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
export const BSCRPC_URL = "https://bsc-dataseed.binance.org/";
export const WSSETHRPC_URL = "wss://mainnet.infura.io/ws/v3/e0e919cefdf04a40875a387f51d64516";
export const WSSBSCRPC_URL = "wss://bsc-mainnet.nodereal.io/ws/v1/62368f2c5ac94dc59139d5b255ba1adb";

export const WHITELIST_TOKENS ={
  ETH:{
    USDT:"0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    ETH:"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    DAI:"0x6b175474e89094c44da98b954eedeac495271d0f",
    UNI:"0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  BSC:{
    BNB:"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    USDT:"0x55d398326f99059ff775485246999027b3197955",
    USDC:"0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    BUSD:"0xe9e7cea3dedca5984780bafc599bd69add087d56",
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"
  }
}