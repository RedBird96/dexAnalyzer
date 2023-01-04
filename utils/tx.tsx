import { BigNumber } from '@ethersproject/bignumber';

// add 10%
export const calculateGasMargin = (value: BigNumber): BigNumber => {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
};

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export default function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString);
}
