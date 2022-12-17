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
  pinSetting: boolean;
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