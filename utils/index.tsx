/**
 *
 * @param x
 * @returns param value with 2 decimal places
 */
 export function numberWithCommasTwoDecimals(x :any) {
  return x
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 *
 * @param x
 * @returns param value with 0 decimal places (a whole number)
 */
export function numberWithCommasNoDecimals(x :any) {
  if (x === null) {
    return "";
  }
  return x
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * We check of the param is a whole number
 * If it is not a whole number we return the value with two decimal places
 * Else we return it as a whole number
 * @param x
 * @returns Whole number or x with two decimal places
 */
 export function isWholeNumber(x:any) {
  if (x % 1 != 0) {
    return numberWithCommasTwoDecimals(x);
  }
  return numberWithCommasNoDecimals(x);
}

export function convertBalanceCurrency(x :any) {
  return '$'+numberWithCommasTwoDecimals(x);
}

export function makeShortAddress(address: string): string {
  if (address.length > 7)
    return address.substring(0, 7) + "...." + address.substring(20, address.length);
  return "";
}