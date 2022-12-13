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
}