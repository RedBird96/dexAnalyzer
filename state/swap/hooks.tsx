import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrency, setTypedValue, switchCurrency } from '.';
import { AppState, useAppDispatch } from '..';
import { Field } from './types';

export const useSwapState = (): AppState['swap'] => {
  return useSelector<AppState, AppState['swap']>(state => state.swap);
};

export const useSwapActions = (): {
  onSelectToken: (field: Field, currencyId: string) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, value: string) => void;
} => {
  const dispatch = useAppDispatch();

  const onSelectToken = useCallback(
    (field: Field, currencyId: string) => {
      dispatch(
        selectCurrency({
          field,
          currencyId,
        })
      );
    },
    [dispatch]
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrency());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, value: string) => {
      dispatch(setTypedValue({ field, value }));
    },
    [dispatch]
  );

  return {
    onSelectToken,
    onSwitchTokens,
    onUserInput,
  };
};
