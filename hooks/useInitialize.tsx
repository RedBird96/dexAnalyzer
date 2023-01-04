import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../state';
import { setApplicationStatus } from '../state/application';
import { ApplicationStatus } from '../state/application/types';
import { replaceState } from '../state/swap';
import { useSwapState } from '../state/swap/hooks';
import { Field } from '../state/swap/types';
import { getPairAddress, getReserves, getToken0Info } from '../utils/pairs';
import { useToken } from './useTokenList';
import { useLPTokenPrice } from './useLPTokenPrice';

const useInitialize = () => {
  const dispatch = useAppDispatch();
  const {lpTokenAddress} =  useLPTokenPrice();
  
  const inputToken = useToken(lpTokenAddress.quoteCurrency_contractAddress);
  const outputToken = useToken(lpTokenAddress.baseCurrency_contractAddress);

  const {
    [Field.Input]: { currencyId: inputCurrencyId },
    [Field.Output]: { currencyId: outputCurrencyId },
  } = useSwapState();

  useEffect(() => {
    if (inputCurrencyId == undefined || outputCurrencyId == undefined) {
      const currency0 = inputCurrencyId ?? inputToken.address;
      const currency1 = outputCurrencyId ?? outputToken.address;

      dispatch(
        replaceState({
          inputCurrencyId: currency0,
          outputCurrencyId: currency1,
        })
      );
    }
  }, [dispatch, inputCurrencyId, outputCurrencyId]);

  const fetchPairReserves = useCallback(async () => {
    if (!inputCurrencyId || !outputCurrencyId) return;

    const pair = await getPairAddress(inputCurrencyId, outputCurrencyId, lpTokenAddress.network);
    if (pair == "0x0000000000000000000000000000000000000000")
      return;
      
    const token0 = await getToken0Info(pair, lpTokenAddress.network);
    const reserves = await getReserves(pair, lpTokenAddress.network);
    if (!reserves) return;

    dispatch(
      replaceState({
        pair: {
          currencyId: pair,
          reserve0: token0.toLowerCase() == inputCurrencyId.toLowerCase() ? reserves[0].toString() : reserves[1].toString(),
          reserve1: token0.toLowerCase() == inputCurrencyId.toLowerCase() ? reserves[1].toString() : reserves[0].toString(),
        },
      })
    );
  }, [dispatch, inputCurrencyId, outputCurrencyId]);

  useEffect(() => {
    const fetchInitialize = async () => {
      await fetchPairReserves();
      dispatch(setApplicationStatus({ appStatus: ApplicationStatus.LIVE }));
    };

    fetchInitialize();
  }, [dispatch, fetchPairReserves]);

  return { fetchPairReserves };
};

export default useInitialize;
