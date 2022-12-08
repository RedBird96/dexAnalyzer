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