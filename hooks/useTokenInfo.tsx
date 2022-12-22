import React, { useContext, useEffect, useState } from "react";
import { ERC20Token } from '../utils/type'

interface TokenInfoInterface {
  tokenData: ERC20Token;
  setTokenData: (token: ERC20Token) => void;
}

const TokenInfoContext: React.Context<null | TokenInfoInterface> =
  React.createContext<null | TokenInfoInterface>(null);

export function TokenInfoProvider({children}:any) {

  let temp:ERC20Token;
  const usdtAddress = "";
    temp = {
      name:"USDT",
      symbol:"USDT",
      contractAddress:usdtAddress,
      price: 1,
      marketCap: "0",
      totalSupply: 0,
      holdersCount: 0,
      balance: 0,
      usdBalance: 0,
      decimals: 6,
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
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
