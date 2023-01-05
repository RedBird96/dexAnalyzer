import { useEffect, useMemo, useState } from 'react';
import DefaultTokenList from '../config/constants/default.tokenlist.json';
import DefaultTokenProdList from '../config/constants/default.tokenlist.prod.json';
import { ERC20Token, Token } from '../utils/type';
import { BINANCE_NETOWRK, BNBToken, ETHERToken } from '../utils/constant';
import { useAccount, useConnect, useNetwork } from '@thirdweb-dev/react';
import { Field } from '../state/swap/types';
import { useLPTokenPrice } from './useLPTokenPrice';


export const useTokenList = () => {
  
  const [chainId, setChainId] = useState(BINANCE_NETOWRK);
  const network = useNetwork();
  const connection = useConnect();
  useEffect(() => {
    if (connection[0].data.connected) {
      setChainId(network[0].data.chain.id);
    }
  }, [connection]);

  return useMemo(() => {
    const list = DefaultTokenList.tokens.map(token => ({
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
      chainId: token.chainId,
      address: token.address,
      logoUri: token.logoURI,
    }));
    list.push(
      ...DefaultTokenProdList.tokens.map(token => ({
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        chainId: token.chainId,
        address: token.address,
        logoUri: token.logoURI,
      }))
    );
    return list.filter(token => token.chainId === chainId);
  }, [chainId]);
};

export const useToken = (token_address: string) : Token => {

    const {lpTokenAddress} =  useLPTokenPrice();

    if (token_address == lpTokenAddress.baseCurrency_contractAddress) {
      return useMemo(() => {
        const token = {
          decimals: lpTokenAddress.baseCurrency_decimals,
          symbol: lpTokenAddress.baseCurrency_name,
          name: lpTokenAddress.baseCurrency_name,
          chainId: lpTokenAddress.network,
          address: lpTokenAddress.baseCurrency_contractAddress,
          logoUri: lpTokenAddress.image
        } as Token
        return token.name == "WBNB" ? BNBToken : token.name == "WETH" ? ETHERToken : token;
      }, [lpTokenAddress.baseCurrency_contractAddress, lpTokenAddress.quoteCurrency_contractAddress])
    } else {
      return useMemo(() => {
        const token = {
          decimals: lpTokenAddress.quoteCurrency_decimals,
          symbol: lpTokenAddress.quoteCurrency_name,
          name: lpTokenAddress.quoteCurrency_name,
          chainId: lpTokenAddress.network,
          address: lpTokenAddress.quoteCurrency_contractAddress,
          logoUri: lpTokenAddress.image
        } as Token
        return token.name == "WBNB" ? BNBToken : token.name == "WETH" ? ETHERToken : token;
      }, [lpTokenAddress.quoteCurrency_contractAddress, lpTokenAddress.quoteCurrency_contractAddress])
    }

  // const list = useTokenList();

  // return useMemo(() => {
  //   if (!tokenAddress) return null;
  //   if (tokenAddress === 'BNB') return ETHERToken;

  //   const tokens = list.filter(token => token.address === tokenAddress);
  //   return tokens.length > 0 ? tokens[0] : undefined;
  // }, [list, tokenAddress]);
};
