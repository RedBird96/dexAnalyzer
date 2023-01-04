import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Field, SwapState } from './types';

const initialState: SwapState = {
  [Field.Input]: {
    currencyId: undefined,
  },
  [Field.Output]: {
    currencyId: undefined,
  },
  pair: undefined,
  independentField: Field.Input,
  typedValue: '',
};

export const SwapSlice = createSlice({
  name: 'Swap',
  initialState,
  reducers: {
    replaceState: (
      state,
      action: PayloadAction<{
        inputCurrencyId?: string;
        outputCurrencyId?: string;
        pair?: {
          currencyId: string;
          reserve0: string;
          reserve1: string;
        };
      }>
    ) => {
      return {
        ...state,
        [Field.Input]: {
          currencyId:
            action.payload.inputCurrencyId ?? state[Field.Input].currencyId,
        },
        [Field.Output]: {
          currencyId:
            action.payload.outputCurrencyId ?? state[Field.Output].currencyId,
        },
        pair: action.payload.pair ?? state.pair,
      };
    },
    selectCurrency: (
      state,
      action: PayloadAction<{
        field: Field;
        currencyId: string;
      }>
    ) => {
      return {
        ...state,
        [action.payload.field]: {
          currency: action.payload.currencyId,
        },
      };
    },
    switchCurrency: state => {
      return {
        ...state,
        [Field.Input]: {
          currencyId: state[Field.Output].currencyId,
        },
        [Field.Output]: {
          currencyId: state[Field.Input].currencyId,
        },
      };
    },
    setTypedValue: (
      state,
      action: PayloadAction<{ field: Field; value: string }>
    ) => {
      return {
        ...state,
        independentField: action.payload.field,
        typedValue: action.payload.value,
      };
    },
  },
});

export const { replaceState, selectCurrency, switchCurrency, setTypedValue } =
  SwapSlice.actions;

export default SwapSlice.reducer;
