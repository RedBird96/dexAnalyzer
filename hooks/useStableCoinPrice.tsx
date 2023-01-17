import React, { useContext, useEffect, useMemo, useState } from "react";
import { ERC20Token } from '../utils/type'
import * as constant from '../utils/constant'
import { getMultiTokenPricefromllama } from "../api";


interface StableCoinPriceInterface {
  coinPrice: ERC20Token[];
  setCoinPrice: (token0Reserve: ERC20Token[]) => void;
}

const StableCoinPriceContext: React.Context<null | StableCoinPriceInterface> =
  React.createContext<null | StableCoinPriceInterface>(null);

export function StableCoinPriceProvider({ children }: any) {

  let coinlist: ERC20Token[] = [];
  const websocketURL = "wss://ws.coincap.io/prices?assets=ethereum,tether,binance-coin,usd-coin,binance-usd,uniswap,multi-collateral-dai,pancakeswap";
  const [coinPriceList, setCoinPriceList] = useState<ERC20Token[]>([]);
  const eth_USDT: ERC20Token = { name: "", symbol: "", network: constant.ETHEREUM_NETWORK, contractAddress: constant.WHITELIST_TOKENS.ETH.USDT.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const eth_USDC: ERC20Token = { name: "", symbol: "", network: constant.ETHEREUM_NETWORK, contractAddress: constant.WHITELIST_TOKENS.ETH.USDC.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const eth_ETH: ERC20Token = { name: "", symbol: "", network: constant.ETHEREUM_NETWORK, contractAddress: constant.WHITELIST_TOKENS.ETH.ETH.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const eth_DAI: ERC20Token = { name: "", symbol: "", network: constant.ETHEREUM_NETWORK, contractAddress: constant.WHITELIST_TOKENS.ETH.DAI.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const eth_UNI: ERC20Token = { name: "", symbol: "", network: constant.ETHEREUM_NETWORK, contractAddress: constant.WHITELIST_TOKENS.ETH.UNI.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };

  const bsc_BNB: ERC20Token = { name: "", symbol: "", network: constant.BINANCE_NETOWRK, contractAddress: constant.WHITELIST_TOKENS.BSC.BNB.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const bsc_USDT: ERC20Token = { name: "", symbol: "", network: constant.BINANCE_NETOWRK, contractAddress: constant.WHITELIST_TOKENS.BSC.USDT.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const bsc_USDC: ERC20Token = { name: "", symbol: "", network: constant.BINANCE_NETOWRK, contractAddress: constant.WHITELIST_TOKENS.BSC.USDC.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const bsc_BUSD: ERC20Token = { name: "", symbol: "", network: constant.BINANCE_NETOWRK, contractAddress: constant.WHITELIST_TOKENS.BSC.BUSD.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const bsc_DAI: ERC20Token = { name: "", symbol: "", network: constant.BINANCE_NETOWRK, contractAddress: constant.WHITELIST_TOKENS.BSC.DAI.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };
  const bsc_CAKE: ERC20Token = { name: "", symbol: "", network: constant.BINANCE_NETOWRK, contractAddress: constant.WHITELIST_TOKENS.BSC.CAKE.toLowerCase(), price: 0, balance: 0, usdBalance: 0, decimals: 0, holdersCount: 0, image: "", owner: "", totalSupply: 0, marketCap: "", pinSetting: false };

  coinlist.push(eth_USDT);
  coinlist.push(eth_USDC);
  coinlist.push(eth_ETH);
  coinlist.push(eth_DAI);
  coinlist.push(eth_UNI);

  coinlist.push(bsc_BNB);
  coinlist.push(bsc_USDT);
  coinlist.push(bsc_USDC);
  coinlist.push(bsc_BUSD);
  coinlist.push(bsc_DAI);
  coinlist.push(bsc_CAKE);

  let wsInstance:WebSocket;

  useEffect(() => {
    const init = async () => {
      const res = await getMultiTokenPricefromllama(coinlist);
      if (res != constant.NOT_FOUND_TOKEN) {
        setCoinPriceList(res);
      }

      wsInstance = new WebSocket(websocketURL);

      wsInstance.addEventListener('message', (event) => {
        const tempCoinlist = coinPriceList;
        try{
          const data = JSON.parse(event.data);
          const keys = Object.keys(data);
          keys.map((name:string) => {
            if (name == "ethereum") {
              tempCoinlist[2].price = data[name];
            } else if (name == "tether") {
              tempCoinlist[0].price = data[name];
              tempCoinlist[6].price = data[name];
            } else if (name == "binance-coin") {
              tempCoinlist[5].price = data[name];
            } else if (name == "usd-coin") {
              tempCoinlist[1].price = data[name];
              tempCoinlist[7].price = data[name];
            } else if (name == "binance-usd") {
              tempCoinlist[8].price = data[name];
            } else if (name == "uniswap") {
              tempCoinlist[4].price = data[name];
            } else if (name == "multi-collateral-dai") {
              tempCoinlist[3].price = data[name];
              tempCoinlist[9].price = data[name];
            } else if (name == "pancakeswap") {
              tempCoinlist[10].price = data[name];
            }
          })      
          setCoinPriceList(tempCoinlist);    
        } catch(e) {

        }
      })
    }
    init();
    return () => {
      wsInstance?.close();
    }
  }, [])

  return (
    <StableCoinPriceContext.Provider
      value={{
        coinPrice: coinPriceList,
        setCoinPrice: setCoinPriceList,
      }}
    >
      {children}
    </StableCoinPriceContext.Provider>
  );
}

export function useStableCoinPrice() {
  const context = useContext(StableCoinPriceContext);
  if (!context) {
    throw new Error("Missing Stable Coin Price context");
  }

  return context;
}
