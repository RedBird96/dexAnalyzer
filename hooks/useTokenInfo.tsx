import React, { useContext, useEffect, useState } from "react";
import { ERC20Token } from '../utils/type'

interface TokenInfoInterface {
  tokenData: ERC20Token;
  setTokenData: (token: ERC20Token) => void;
  listTokens: ERC20Token[];
  setListTokens: (tokens: ERC20Token[]) => void;
  buyTax: number;
  setBuyTax: (tax:number) => void;
  sellTax: number;
  setSellTax: (tax: number) => void;
}

const TokenInfoContext: React.Context<null | TokenInfoInterface> =
  React.createContext<null | TokenInfoInterface>(null);

export function TokenInfoProvider({children}:any) {

  let temp:ERC20Token;
  temp = {
    name:"",
    symbol:"",
    contractAddress:"",
    price: 1,
    marketCap: "0",
    totalSupply: 0,
    holdersCount: 0,
    balance: 0,
    usdBalance: 0,
    decimals: 6,
    image: "",
    controller: undefined
  } as ERC20Token
  
  const [token, setToken] = useState<ERC20Token>(temp);
  const [tokenList, setTokenList] = useState<ERC20Token[]>([]);
  const [buyTax, setBuyTax] = useState(0);
  const [sellTax, setSellTax] = useState(0);
  return(
    <TokenInfoContext.Provider
      value={{
        tokenData:token,
        setTokenData: setToken,
        listTokens: tokenList,
        setListTokens: setTokenList,
        buyTax: buyTax,
        setBuyTax: setBuyTax,
        sellTax: sellTax,
        setSellTax: setSellTax
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
