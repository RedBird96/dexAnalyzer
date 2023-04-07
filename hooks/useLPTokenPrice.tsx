import React, { useContext, useEffect, useState } from "react";
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import SRGToken from '../config/SRGToken.json';
import { BigNumber, Contract, ethers } from "ethers";
import Web3 from "web3";
import { AbiItem } from 'web3-utils'
import { LPTokenPair, TokenSide } from '../utils/type'
import * as constant from '../utils/constant'
import { useStableCoinPrice } from "./useStableCoinPrice";
import { useTokenInfo } from "./useTokenInfo";
import { Call, multicallv2 } from "../utils/multicall";
import { RECONNECT_WEBSOCKET } from "../utils/constant";

interface ownerTokenPrice {
  tokenPrice: number;
  lpBaseTokenAddress: string;
}

interface LpTokenPriceInterface {
  lpTokenPrice: ownerTokenPrice;
  setLPTokenPrice: (lpTokenPrice: ownerTokenPrice) => void;
  lpTokenAddress: LPTokenPair;
  setLPTokenAddress: (tokenAddress: LPTokenPair) => void;
}

const LpTokenPriceContext: React.Context<null | LpTokenPriceInterface> =
  React.createContext<null | LpTokenPriceInterface>(null);

let subscription:any;

export function LpTokenPriceProvider({children}:any) {

  const {coinPrice} = useStableCoinPrice();
  const {tokenData} = useTokenInfo();
  const [lptokenPrice, setlpTokenPrice] = useState<ownerTokenPrice>({
    tokenPrice:0,
    lpBaseTokenAddress:"0x55d398326f99059ff775485246999027b3197955"
  });
  const [lptokenAddress, setlpTokenAddress] = useState<LPTokenPair>({
    name:"BNB/USDT",
    symbol:"BNB/USDT",
    contractAddress:"",
    price: 0,
    marketCap: "",
    totalSupply: 0,
    holdersCount: 0,
    balance: 0,
    decimals: 18,
    image: "",
    network: constant.BINANCE_NETOWRK,
    baseCurrency_name:"BNB",
    quoteCurrency_name:"USDT",
    quoteCurrency_contractAddress:"",
    token0_name: "BNB",
    token1_name: "USDT",
    token0_reserve: 0,
    token1_reserve: 0,
    token0_contractAddress: "0x55d398326f99059ff775485246999027b3197955",
    token1_contractAddress: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    tokenside: TokenSide.token0,
    ownerToken: "",
    token0_decimal: 18,
    token1_decimal: 18,
  } as LPTokenPair);
  let web3Http: any, PairContractWSS:Contract, PairContractHttp:Contract;

  const updateSRGState = async(from:string, to:string, value: number) => {
        
    if (tokenData == undefined || tokenData.contractAddress == "" || tokenData.contractAddress.toLowerCase() != lptokenAddress.ownerToken.toLowerCase())
      return;

    // console.log('updateSRGState');

    const reserveCalls: Call[] = [
      {
        name: 'calculatePrice',
        address: tokenData.contractAddress,
        params: [],
      },
      {
        name: 'getBNBPrice',
        address: tokenData.contractAddress,
        params: [],
      },
      {
        name: 'getLiquidity',
        address: tokenData.contractAddress,
        params: [],
      },
    ];
    const response = await multicallv2(SRGToken, reserveCalls, tokenData.network);

    const calPrice = parseInt(response[0][0]._hex, 16);
    const bnbPrice = parseInt(response[1][0]._hex, 16);
    const reserve1 = parseInt(response[2][0]._hex, 16);
    const price = calPrice / Math.pow(10, 9) * bnbPrice / Math.pow(10, tokenData.network == constant.ETHEREUM_NETWORK ? 6 : 18);
    setlpTokenPrice({
      tokenPrice: price,
      lpBaseTokenAddress: tokenData.contractAddress
    });
    // console.log('price update', price);

    const tempLP = lptokenAddress;
    tempLP.token0_reserve = 0;
    tempLP.token1_reserve = reserve1 / Math.pow(10, 18);
    tempLP.price = price;
    setlpTokenAddress(tempLP);    
  }
  const updateState = async (reserve0:any, reserve1:any) => {
    // update state
    // state.token0 = BigNumber.from(data.returnValues.reserve0);
    // state.token1 = BigNumber.from(data.returnValues.reserve1);

      if (tokenData == undefined || tokenData.contractAddress == "" || tokenData.contractAddress.toLowerCase() != lptokenAddress.ownerToken.toLowerCase())
        return;

      const token0Reserve = parseInt(reserve0) / Math.pow(10, lptokenAddress.token0_decimal!);
      const token1Reserve = parseInt(reserve1) / Math.pow(10, lptokenAddress.token1_decimal!);
      //if (lptokenAddress.tokenside == TokenSide.token0) { 
        


      if (tokenData.contractAddress.toLowerCase() == lptokenAddress.token0_contractAddress.toLowerCase()) {
        const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                    lptokenAddress.token1_contractAddress + lptokenAddress.network);
        let price = 1;
        if (coin != undefined) {
          price = coin.price;
        }         
        setlpTokenPrice({ 
          tokenPrice: token1Reserve / token0Reserve * price,
          lpBaseTokenAddress: lptokenAddress.ownerToken!
        });
      } else {
        const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                    lptokenAddress.token0_contractAddress + lptokenAddress.network);
        let price = 1;
        if (coin != undefined) {
          price = coin.price;
        }                         
        setlpTokenPrice( {
          tokenPrice:token0Reserve / token1Reserve * price,
          lpBaseTokenAddress: lptokenAddress.ownerToken!
        });
      }
      const tempLP = lptokenAddress;
      tempLP.token0_reserve = token0Reserve;
      tempLP.token1_reserve = token1Reserve;
      setlpTokenAddress(tempLP);
  };

  // function to get reserves
  const getReserves = async (ContractObj: any) => {
    // call getReserves function of Pair contract
    const _reserves = await ContractObj.methods.getReserves().call();
    // return data in Big Number
    return [parseInt(_reserves._reserve0) / Math.pow(10, lptokenAddress.token0_decimal!), 
            parseInt(_reserves._reserve1) / Math.pow(10, lptokenAddress.token1_decimal!)];
  };
    
  const init = async() => {
      
    if (lptokenAddress.network == constant.ETHEREUM_NETWORK) {
      const webWss = new ethers.providers.WebSocketProvider("wss://mainnet.infura.io/ws/v3/e0e919cefdf04a40875a387f51d64516");
      PairContractWSS = new ethers.Contract(lptokenAddress.contractAddress, UniswapV2Pair, webWss); 
      web3Http = new Web3(constant.ETHRPC_URL);
      PairContractHttp = new web3Http.eth.Contract(
        UniswapV2Pair as AbiItem[],
        lptokenAddress.contractAddress
      );   
    } else {
      const webWss = new ethers.providers.WebSocketProvider("wss://bsc-mainnet.nodereal.io/ws/v1/62368f2c5ac94dc59139d5b255ba1adb");
      PairContractWSS = new ethers.Contract(lptokenAddress.contractAddress, PancakeswapV2Pair, webWss);
      web3Http = new Web3(constant.BSCRPC_URL);
      PairContractHttp = new web3Http.eth.Contract(
        PancakeswapV2Pair as AbiItem[],
        lptokenAddress.contractAddress
      );
    }
    let token0Reserve, token1Reserve;
    [token0Reserve, token1Reserve] = await getReserves(PairContractHttp);
    if (tokenData.contractAddress.toLowerCase() == lptokenAddress.token0_contractAddress.toLowerCase()) {
      const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                  lptokenAddress.token1_contractAddress + lptokenAddress.network);
      let price = 1;
      if (coin != undefined) {
        price = coin.price;
      }      
      setlpTokenPrice({
        tokenPrice:token1Reserve / token0Reserve * price,
        lpBaseTokenAddress: lptokenAddress.ownerToken!
      });
    } else {
      const coin = coinPrice.find((value) => value.contractAddress.toLowerCase() + value.network ==
                  lptokenAddress.token0_contractAddress + lptokenAddress.network);
      let price = 1;
      if (coin != undefined) {
        price = coin.price;
      }            
      setlpTokenPrice({
        tokenPrice:token0Reserve / token1Reserve * price,
        lpBaseTokenAddress: lptokenAddress.ownerToken!
      });
    }
    
    const tempLP = lptokenAddress;
    tempLP.token0_reserve = token0Reserve;
    tempLP.token1_reserve = token1Reserve;
    setlpTokenAddress(tempLP);

    const filterSync = PairContractWSS.filters.Sync()
    const event = PairContractWSS.on(filterSync, async(reserve0, reserve1, event) => {
      updateState(reserve0, reserve1);
    });
    subscription = event;
  }

  const srgInit = async() => {

    if (lptokenAddress.network == constant.ETHEREUM_NETWORK) {
      const webWss = new ethers.providers.WebSocketProvider("wss://mainnet.infura.io/ws/v3/e0e919cefdf04a40875a387f51d64516");
      PairContractWSS = new ethers.Contract(lptokenAddress.contractAddress, SRGToken, webWss); 
      web3Http = new Web3(constant.ETHRPC_URL);
      PairContractHttp = new web3Http.eth.Contract(
        SRGToken as AbiItem[],
        lptokenAddress.contractAddress
      );   
    } else {
      const webWss = new ethers.providers.WebSocketProvider("wss://bsc-mainnet.nodereal.io/ws/v1/62368f2c5ac94dc59139d5b255ba1adb");
      PairContractWSS = new ethers.Contract(lptokenAddress.contractAddress, SRGToken, webWss);
      web3Http = new Web3(constant.BSCRPC_URL);
      PairContractHttp = new web3Http.eth.Contract(
        SRGToken as AbiItem[],
        lptokenAddress.contractAddress
      );
    }

    const calPrice =  await PairContractHttp.methods.calculatePrice().call();
    const bnbPrice = await PairContractHttp.methods.getBNBPrice().call();
    const price = calPrice / Math.pow(10, 9) * bnbPrice / Math.pow(10, tokenData.network == constant.ETHEREUM_NETWORK ? 6 : 18);
    setlpTokenPrice({
      tokenPrice: price,
      lpBaseTokenAddress: lptokenAddress.contractAddress
    });

    const liquidity = await PairContractHttp.methods.getLiquidity().call();
    const tempLP = lptokenAddress;
    tempLP.token0_reserve = 0;
    tempLP.token1_reserve = liquidity / Math.pow(10, 18);
    tempLP.price = price;
    setlpTokenAddress(tempLP);

    const event = PairContractWSS.on("Transfer", async(from, to, value) => {
      updateSRGState(from, to, value);
    });

    subscription = event;

  }

  const callInits = () => {
    if (tokenData != undefined && 
      lptokenAddress.baseCurrency_contractAddress != undefined &&
      lptokenAddress.contractAddress != undefined && 
      lptokenAddress.contractAddress.length > 0) {
      if (lptokenAddress.baseCurrency_contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() || 
          lptokenAddress.baseCurrency_contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
          srgInit();
      } else {
        init();
      }
    } else {
      setlpTokenPrice({tokenPrice:0,lpBaseTokenAddress:""});
    }
  }
  useEffect(() => {
    callInits();
    const interval = setInterval(() => {
      if (subscription) {
        subscription.removeAllListeners();
      }
      callInits();
    }, RECONNECT_WEBSOCKET);
    return ()=>{ 
      if (interval) {
        clearInterval(interval);
      }
      if (subscription) {
        subscription.removeAllListeners();
      }
    }
  }, [lptokenAddress.contractAddress])  

  return(
    <LpTokenPriceContext.Provider
      value={{     
        lpTokenPrice:lptokenPrice,
        setLPTokenPrice: setlpTokenPrice,
        lpTokenAddress:lptokenAddress,
        setLPTokenAddress: setlpTokenAddress
      }}
      >
        {children}
      </LpTokenPriceContext.Provider>
  );
}

export function useLPTokenPrice() {
  const context = useContext(LpTokenPriceContext);
  if (!context) {
    throw new Error("Missing LPTokenPrice context");
  }

  return context;
}
