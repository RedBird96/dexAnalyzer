/**
 *
 * @param x
 * @returns param value with 2 decimal places
 */
 export function numberWithCommasTwoDecimals(x :any, decimals = 3) {
  return x
    .toFixed(decimals)
    .toString()
    .replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
}

/**
 *
 * @param x
 * @returns param value with 0 decimal places (a whole number)
 */
export function numberWithCommasNoDecimals(x :number) {
  if (x === null) {
    return "";
  }
  return x
    .toFixed(0)
    .toString()
    .replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
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

export function convertBalanceCurrency(x :any, decimals = 3) {
  if (decimals != 0)
    return '$'+numberWithCommasTwoDecimals(x, decimals);
  return '$'+numberWithCommasNoDecimals(x);
}

export function makeShortAddress(address: string, limitLen = 7): string {
  if (address.length > limitLen)
    return address.substring(0, 9) + "......." + address.substring(31, address.length);
  return "";
}

export function makeShortTokenName(name: string, len: number): string {
  if (name.length > len)
    return name.substring(0, len) + "..";
  return name;
}

export function makeShortTxHash(txHash:string): string {
  return txHash.substring(0, 4) + "..." + txHash.substring(64,66);
}

/*
 * General utils for managing cookies in Typescript.
 */
export function setCookie(name: string, val: string) {
  const date = new Date();
  const value = val;

  // Set it expire in 7 days
  date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

  // Set it
  document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
}

export function getCookie(name: string) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");

  if (parts.length == 2) {
      // @ts-ignore
      return parts.pop().split(";").shift();
  }
}

export function deleteCookie(name: string) {
  const date = new Date();

  // Set it expire in -1 days
  date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

  // Set it
  document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
}

export function makeTemplateDate(originDate : Date, resolution: number): Date{
  let res:Date = originDate;
  let year = originDate.getFullYear();
  let month = originDate.getMonth();
  let day = originDate.getDate();
  let hour = originDate.getHours();
  let minute = originDate.getMinutes();
  switch(resolution) {
    case 1:
      res = originDate;
      break;
    case 5:
      const re5Min = Math.round(minute / 10) * 10;
      if ((minute % 10 / 5).toFixed(0) == '1') {
        minute = re5Min + 5;
      }
      res = new Date(year, month, day, hour, minute,0);
      break;
    case 10:
      minute = Math.round(minute / 10) * 10;
      res = new Date(year, month, day, hour, minute,0);
      break;
    case 30:
      res = new Date(year, month, day, hour, minute < 30 ? 0 : 30,0);
      break;
    case 60:
      res = new Date(year, month, day, hour,0,0);
      break;
    case 360:
      if (hour < 6)
        hour = 0;
      else if (hour < 12)
        hour = 6;
      else if (hour < 18)
        hour = 12;
      else 
        hour = 18;
      break;
    case 720:
      res = new Date(year, month, day, hour, 0 , 0);
      break;
    case 1440:
      res = new Date(year, month, day, 0,0,0);
      break;
  }

  return res;
}