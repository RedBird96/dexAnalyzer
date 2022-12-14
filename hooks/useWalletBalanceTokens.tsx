import React, { useContext, useEffect, useState } from "react";
import {
  getTokenInfoFromWalletAddress
} from '../api'
import { ERC20Token } from '../utils/type'

interface WalletTokenBalanceInterface {
  walletTokens: ERC20Token[];
  setWalletTokens: (token: ERC20Token[]) => void;
}

const WalletTokenBalanceContext: React.Context<null | WalletTokenBalanceInterface> =
  React.createContext<null | WalletTokenBalanceInterface>(null);

export function WalletTokenBalanceProvider({children}:any) {
   
  const [tokens, setTokens] = useState<ERC20Token[]>([]);
  return(
    <WalletTokenBalanceContext.Provider
      value={{
        walletTokens:tokens,
        setWalletTokens: setTokens,
      }}
      >
        {children}
      </WalletTokenBalanceContext.Provider>
  );
}

export function useWalletTokenBalance() {
  const context = useContext(WalletTokenBalanceContext);
  if (!context) {
    throw new Error("Missing Wallet Token Balance context");
  }

  return context;
}
