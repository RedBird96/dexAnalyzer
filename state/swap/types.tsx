export enum Field {
  Input = 'input',
  Output = 'output',
}
export interface SwapState {
  readonly [Field.Input]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.Output]: {
    readonly currencyId: string | undefined;
  };
  readonly pair?: {
    readonly currencyId: string;
    readonly reserve0: string; // reserve for input currency
    readonly reserve1: string; // reserve for output currency
  };
  readonly independentField: Field;
  readonly typedValue: string;
}
