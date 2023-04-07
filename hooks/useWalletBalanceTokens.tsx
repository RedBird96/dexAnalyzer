import React, { useContext, useEffect, useState } from "react";
import { ERC20Token } from '../utils/type'
import { useAddress, useNetwork } from "@thirdweb-dev/react";
import { getContractInfoFromWalletAddress } from "../api";
import * as constant from '../utils/constant'

interface WalletTokenBalanceInterface {
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
  walletTokens: ERC20Token[];
  setWalletTokens: (token: ERC20Token[]) => void;
}

const WalletTokenBalanceContext: React.Context<null | WalletTokenBalanceInterface> =
  React.createContext<null | WalletTokenBalanceInterface>(null);

export function WalletTokenBalanceProvider({children}:any) {
   
  const address = useAddress();
  const network = useNetwork();  
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState<ERC20Token[]>([]);


  const getTokensFromWallet = async() => {

    let usdBalance = 0;
    if (network[0].data.chain?.id == 1) {
      let tempTokens: ERC20Token[] = [];
      const res = await getContractInfoFromWalletAddress(address!, network[0].data.chain?.id == 1 ? constant.ETHEREUM_NETWORK : constant.BINANCE_NETOWRK);
      const ethBalance = res.ETH.balance;
      const ethPrice = res.ETH.price.rate;
      const usdETHBalance = ethBalance * ethPrice;
      const ETHLINK = "https://etherscan.io/address/";

      tempTokens.push({
        name:network[0].data.chain?.id == 1 ? "ETH" : "BNB",
        symbol: network[0].data.chain?.id == 1 ? "ETH" : "BNB",
        contractAddress: address,
        price: ethPrice,
        balance: ethBalance,
        usdBalance: usdETHBalance,
        holdersCount: 0,
        image: "",
        network: constant.ETHEREUM_NETWORK,
        owner: address,
        totalSupply: 0,
        marketCap: "",
        contractPage: ETHLINK + address
      } as ERC20Token)

      usdBalance += usdETHBalance;
      if (res.hasOwnProperty("tokens")) {
        const tokenCnt = Object.keys(res["tokens"]).length;
        if (tokenCnt != 0) {
          res.tokens.forEach((value: any) => {
            const tokenPrice = value.tokenInfo.price == false ? 0 : value.tokenInfo.price.rate;
            const decimal = parseInt(value.tokenInfo.decimals);
            const tokenBalance = decimal != 0 ? value.balance / Math.pow(10, decimal) : 0;
            const tokenUSDBalance = tokenBalance * tokenPrice;
            if (tokenPrice != 0){
              usdBalance += tokenUSDBalance;
            }
            tempTokens.push({
              name:value.tokenInfo.name,
              symbol: value.tokenInfo.symbol,
              contractAddress: value.tokenInfo.address,
              price: tokenPrice,
              balance: tokenBalance,
              usdBalance: tokenUSDBalance,
              decimals: decimal,
              holdersCount: value.tokenInfo.holdersCount,
              image: value.tokenInfo.image,
              owner: value.tokenInfo.owner,
              totalSupply: value.tokenInfo.totalSupply,
              marketCap: value.tokenInfo.totalSupply,
              contractPage: ETHLINK + value.tokenInfo.address,
              network: constant.ETHEREUM_NETWORK
            } as ERC20Token)
          });
        }
      }
      setTokens(tempTokens);
    } else {
      const res = await getContractInfoFromWalletAddress(address!, network[0].data.chain?.id == 1 ? constant.ETHEREUM_NETWORK : constant.BINANCE_NETOWRK);

      if (res != constant.NOT_FOUND_TOKEN){
        res.forEach((value: ERC20Token) => {
          usdBalance += value.usdBalance;
        });
        setTokens(res);
      }
    }
    setBalance(usdBalance);
  }  

  useEffect(() => {

    if (address == null || address == "")
      return;

    getTokensFromWallet();

  }, [address, network[0].data.chain?.id])

  return(
    <WalletTokenBalanceContext.Provider
      value={{
        walletBalance: balance,
        setWalletBalance: setBalance,
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
