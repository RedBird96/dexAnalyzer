import React, { useContext, useEffect, useState } from "react";
import UniswapV2Pair from '../config/IUniswapV2Pair.json';
import PancakeswapV2Pair from '../config/IPancakeswapV2Pair.json';
import { BigNumber } from "ethers";
import Web3 from "web3";
import { AbiItem } from 'web3-utils'
import { LPTokenPair, TokenSide } from '../utils/type'
import * as constant from '../utils/constant'
import { getTokenPricefromCoingeckoAPI } from "../api";


interface LpTokenPriceInterface {
  lptoken0Reserve: number;
  setLPToken0Reserve: (token0Reserve: number) => void;
  lptoken1Reserve: number;
  setLPToken1Reserve: (token1Reserve: number) => void;
  lpTokenPrice: number;
  setLPTokenPrice: (lpTokenPrice: number) => void;
  lpTokenAddress: LPTokenPair;
  setLPTokenAddress: (tokenAddress: LPTokenPair) => void;
}

const LpTokenPriceContext: React.Context<null | LpTokenPriceInterface> =
  React.createContext<null | LpTokenPriceInterface>(null);

export function LpTokenPriceProvider({children}:any) {

  const [eventEmitter, setEventEmitter] = useState<any>();
  const [lptokenPrice, setlpTokenPrice] = useState<number>(0);
  const [token0Reserve, setToken0Reserve] = useState<number>(0);
  const [token1Reserve, setToken1Reserve] = useState<number>(0);
  const [lptokenAddress, setlpTokenAddress] = useState<LPTokenPair>({
    name:"BNB/USDT",
    symbol:"BNB/USDT",
    contractAddress:"0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE",
    price: 0,
    marketCap: "",
    totalSupply: 0,
    holdersCount: 0,
    balance: 0,
    decimals: 18,
    image: "",
    network: constant.BINANCE_NETOWRK,
    token0_name: "BNB",
    token1_name: "USDT",
    token0_reserve: 0,
    token1_reserve: 0,
    token0_contractAddress: "0x55d398326f99059ff775485246999027b3197955",
    token1_contractAddress: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    tokenside: TokenSide.token0,
    ownerToken: "0x55d398326f99059ff775485246999027b3197955"
  } as LPTokenPair);
  let web3Wss: Web3, web3Http: Web3, PairContractWSS:any, PairContractHttp:any;

  const updateState = async(data:any) => {
    // update state
    // state.token0 = BigNumber.from(data.returnValues.reserve0);
    // state.token1 = BigNumber.from(data.returnValues.reserve1);

      const token0Reserve = parseInt(data.returnValues.reserve0);
      const token1Reserve = parseInt(data.returnValues.reserve1);

      // console.log('token0Reserve, token1Reserve', token0Reserve, token1Reserve);
      if (lptokenAddress.tokenside == TokenSide.token0) { 
        setlpTokenPrice(token1Reserve / token0Reserve);
      } else {
        setlpTokenPrice(token0Reserve / token1Reserve);
      }
      setToken0Reserve(token0Reserve);
      setToken1Reserve(token1Reserve);

  };

  // function to get reserves
  const getReserves = async (ContractObj: any) => {
    // call getReserves function of Pair contract
    const _reserves = await ContractObj.methods.getReserves().call();
    // return data in Big Number
    return [parseInt(_reserves._reserve0), 
            parseInt(_reserves._reserve1)];
  };
    
  useEffect(() => {
    const init = async() => {
      

      if (lptokenAddress.network == constant.ETHEREUM_NETWORK) {
        web3Wss = new Web3(constant.WSSETHRPC_URL);
        PairContractWSS = new web3Wss.eth.Contract(
          UniswapV2Pair.abi as AbiItem[],
          lptokenAddress.contractAddress
        );  
        web3Http = new Web3(constant.ETHRPC_URL);
        PairContractHttp = new web3Http.eth.Contract(
          UniswapV2Pair.abi as AbiItem[],
          lptokenAddress.contractAddress
        );   
      } else {
        web3Wss = new Web3(constant.WSSBSCRPC_URL);
        PairContractWSS = new web3Wss.eth.Contract(
          PancakeswapV2Pair as AbiItem[],
          lptokenAddress.contractAddress
        );  
        web3Http = new Web3(constant.BSCRPC_URL);
        PairContractHttp = new web3Http.eth.Contract(
          PancakeswapV2Pair as AbiItem[],
          lptokenAddress.contractAddress
        );       
      }
      let token0Reserve, token1Reserve;
      [token0Reserve, token1Reserve] = await getReserves(PairContractHttp);
      if (lptokenAddress.tokenside == TokenSide.token0) {
        setlpTokenPrice(token1Reserve / token0Reserve);
      } else {
        setlpTokenPrice(token0Reserve / token1Reserve);
      }
      setToken0Reserve(token0Reserve);
      setToken1Reserve(token1Reserve);

      const event = PairContractWSS.events.Sync({})
        .on("data", (data:any) => updateState(data));

      setEventEmitter(event);

      // console.log('subscribe', lptokenAddress.contractAddress);
      // console.log('subscribe_event:', event);
    }
    if (lptokenAddress.contractAddress != undefined && lptokenAddress.contractAddress.length > 0){
      init();
    } else {
      setlpTokenPrice(0);
      setToken0Reserve(0);
      setToken1Reserve(0);
    }
    return ()=>{ 

      // console.log('unsubscribe');
      // console.log('eventEmitter', eventEmitter);
      if(eventEmitter != undefined) {
        const id = eventEmitter.id;
        eventEmitter.options.requestManager.removeSubscription(id);
      }
    }
  }, [lptokenAddress.contractAddress])  

  return(
    <LpTokenPriceContext.Provider
      value={{
        lptoken0Reserve:token0Reserve,
        setLPToken0Reserve: setToken0Reserve,
        lptoken1Reserve:token1Reserve,
        setLPToken1Reserve: setToken1Reserve,        
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
