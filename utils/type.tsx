import BigNumber from "bignumber.js";

export enum PlayMode {
  Trade,
  Game,
}

export interface ERC20Token {
  name: string;
  symbol: string;
  network: number;
  contractAddress: string;
  price: number;
  balance: number;
  usdBalance: number;
  decimals: number;
  holdersCount: number;
  image: string;
  owner: string;
  totalSupply: number;
  marketCap: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  medium?: string;
  instagra?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  reddit?: string;
  pinSetting: boolean;
  contractCodeURL?: string;
  contractBalanceWalletURL?: string;
  contractBalanceURL?: string;
  contractPage?: string;
}

export enum SearchStatus {
  notsearch,
  searching,
  nodata,
  founddata,
}

export enum TokenSide {
  token0,
  token1,
}

export interface LPTokenPair extends ERC20Token {
  token0_name: string;
  token0_contractAddress: string;
  token1_name: string;
  token0_reserve: number;
  token1_reserve: number;
  tokenside: number;
  token1_contractAddress: string;
  ownerToken?: string;
  token0_decimal?: number;
  token1_decimal?: number;
  protocolType?: string;
  baseCurrency_contractAddress?: string;
  baseCurrency_name?: string;
  baseCurrency_decimals?: number;
  quoteCurrency_contractAddress?: string;
  quoteCurrency_name?: string;
  quoteCurrency_decimals?: number;
  pairContractURL?: string;
}

export interface Block {
  number: number
  timestamp: string
}

export interface PriceChartEntry {
  time: number
  open: number
  close: number
  high: number
  low: number
}

export interface TransactionType {
  buy_sell: string
  baseToken_amount: number;
  quoteToken_symbol: string;
  quoteToken_amount: number;
  transaction_utc_time: string;
  transaction_local_time: string;
  transaction_hash: string;
}


export interface Currency {
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface Token extends Currency {
  chainId: number;
  address: string;
  logoUri?: string;
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export interface Pair {
  currencyId: string;
  reserve0: BigNumber;
  reserve1: BigNumber;
}

export interface Trade {
  pair: Pair;
  tokenIn: Token;
  tokenOut: Token;
  tradeType: TradeType;
  amountIn: BigNumber | null;
  amountOut: BigNumber | null;
}
