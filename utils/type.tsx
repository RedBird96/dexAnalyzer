export interface ERC20Token {
  name: string;
  symbol: string;
  network: number;
  contractAddress: string;
  price: number;
  balance?: number;
  usdBalance: number;
  decimals: number;
  holdersCount: number;
  image: string;
  owner: string;
  totalSupply: string;
  marketCap: string;
  website?: string;
  facebook?: string;
  twitter?: string;
}