import { Token } from "./type";
import BigNumber from 'bignumber.js';

export const SCREEN2XL_SIZE = 2200;
export const SCREENNXL_SIZE = 1700;
export const SCREENMD_SIZE = 1200;
export const SCREENSM_SIZE = 600;

export const NOT_FOUND_TOKEN = "No results found";

export const ETHEREUM_NETWORK = 1;
export const BINANCE_NETOWRK = 56;
export const ETHRPC_URL = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
export const BSCRPC_URL = "https://bsc-dataseed3.binance.org/";
export const WSSETHRPC_URL = "wss://mainnet.infura.io/ws/v3/e0e919cefdf04a40875a387f51d64516";
export const WSSBSCRPC_URL = "wss://bsc-mainnet.nodereal.io/ws/v1/62368f2c5ac94dc59139d5b255ba1adb";

const GELATO_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

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

export const PANCAKESWAP_FACTORY = {
  v1:"0xBCfCcbde45cE874adCB698cC183deBcF17952812",
  v2:"0xca143ce32fe78f1f7019d7d551a6402fc5350c73"
}

export const UNISWAP_FACTORY = {
  v2:"0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  v3:"0x1F98431c8aD98523631AE4a59f267346ea31F984"
}

export const PANCAKESWAP_ROUTER = {
  v2:"0x10ed43c718714eb63d5aa57b78b54704e256024e"
}

export const UNISWAP_ROUTER = {
  v2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
}

export const MULTICALL_ADDRESS = {
  ETH:"0x5ba1e12693dc8f9c48aad8770482f4739beed696",
  BSC:"0xff6fd90a470aaa0c1b8a54681746b07acdfedc9b"
}

export const INIT_CODE_HASH = "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5";

export const ETHERToken: Token = {
  decimals: 18,
  symbol: 'ETH',
  name: 'ETH',
  chainId: BINANCE_NETOWRK,
  address: GELATO_ADDRESS,
  logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
};

export const BNBToken: Token = {
  decimals: 18,
  symbol: 'BNB',
  name: 'BNB',
  chainId: BINANCE_NETOWRK,
  address: GELATO_ADDRESS,
  logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
};

export const FEES_NUMERATOR = new BigNumber(9975);
export const FEES_DENOMINATOR = new BigNumber(10000);
export const BIG_ZERO = new BigNumber(0)
export const BIG_ONE = new BigNumber(1)
export const BIG_TWO = new BigNumber(2)
export const BIG_NINE = new BigNumber(9)
export const BIG_TEN = new BigNumber(10)


export const MAX_DECIMAL_DIGITS = 6;