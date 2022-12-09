import React, { useContext, useEffect, useState } from "react";
import {
  getTokenInfoFromWalletAddress
} from '../api'
import { ERC20Token } from '../utils/type'

interface TokenInfoInterface {
  tokenData: ERC20Token;
  setTokenData: (token: ERC20Token) => void;
}

const TokenInfoContext: React.Context<null | TokenInfoInterface> =
  React.createContext<null | TokenInfoInterface>(null);

export function TokenInfoProvider({children}:any) {

  let temp:ERC20Token;
  const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    temp = {
      name:"USDT",
      symbol:"USDT",
      contractAddress:usdtAddress,
      price: 1.0000656382416633,
      marketCap: "65448727018.6056",
      totalSupply: "32297366521996886",
      holdersCount: 4408623,
      balance: 0,
      decimals: 6,
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png"
    } as ERC20Token
  
  const [token, setToken] = useState<ERC20Token>(temp);
  return(
    <TokenInfoContext.Provider
      value={{
        tokenData:token,
        setTokenData: setToken,
      }}
      >
        {children}
      </TokenInfoContext.Provider>
  );
}

export function useTokenInfo() {
  const context = useContext(TokenInfoContext);
  if (!context) {
    throw new Error("Missing TokenInfo context");
  }

  return context;
}
