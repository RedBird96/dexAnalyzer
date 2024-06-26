/* eslint-disable */
import * as React from 'react'
import { useColorMode } from "@chakra-ui/react"
import {
  widget,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  IChartingLibraryWidget,
  ResolutionString,
} from '../../api/charting_library'
import {
  setCookie,
  getCookie,
  deleteCookie
} from '../../utils'
import SRGToken from '../../config/SRGToken.json';
import { useLPTokenPrice, useLPTransaction, useTokenInfo } from '../../hooks'
import { getLimitTimeHistoryData } from '../../api/bitquery_graphql'
import { TokenSide } from '../../utils/type'
import { makeTemplateDate } from '../../utils'
import { getLastTransactionsLogsByTopic, getLPTransactionListFromWallet, getSRGTimestamp, getSRGTx } from '../../api'
import { useStableCoinPrice } from '../../hooks/useStableCoinPrice'
import { ConvertEventtoTransaction } from '../TokenTransaction/module'
import * as constant from '../../utils/constant'
import { useAddress } from '@thirdweb-dev/react'
import { ethers } from 'ethers'
import { Call, multicallv2 } from '../../utils/multicall'

// eslint-disable-next-line import/extensions

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol']
  interval: ChartingLibraryWidgetOptions['interval']
  // BEWARE: no trailing slash is expected in feed URL
  datafeedUrl: string
  libraryPath: ChartingLibraryWidgetOptions['library_path']
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']
  clientId: ChartingLibraryWidgetOptions['client_id']
  userId: ChartingLibraryWidgetOptions['user_id']
  fullscreen: ChartingLibraryWidgetOptions['fullscreen']
  autosize: ChartingLibraryWidgetOptions['autosize']
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides']
  container: ChartingLibraryWidgetOptions['container']
  height: number
  resize: boolean
}

const ChartContainerProps = {
  symbol: 'AAPL',
  interval: '60' as ResolutionString,
  containerId: 'dexAnalyzer_chart_container',
  datafeedUrl: 'https://demo_feed.tradingview.com',
  libraryPath: '/charting_library/',
  chartsStorageUrl: 'https://saveload.tradingview.com',
  chartsStorageApiVersion: '1.0',
  clientId: 'tradingview.com',
  userId: 'public_user_id',
  fullscreen: false,
  autosize: true,
  studiesOverrides: {},
  height: 600
}

function getLanguageFromURL(): LanguageCode | null {
  const regex = new RegExp('[\\?&]lang=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode)
}

const ChartContainer: React.FC<Partial<ChartContainerProps>> = (props) => {

  const { colorMode } = useColorMode();
  let tvWidget: IChartingLibraryWidget | null = null
  const {lpTokenAddress} = useLPTokenPrice();
  const {tokenData} = useTokenInfo();
  const {coinPrice} = useStableCoinPrice();
  let preReserve0 = 0;
  let preReserve1 = 0;

  const address = useAddress();
  let myInterval: any
  let currentResolutions: any
  const [tokendetails, setTokenDetails] = React.useState({
    pair: ' ',
  })
  let timeStampArr: any[] = [];
  let priceData: any[] = [];
  let showOrder = false;
  let lastBarsCache: any;

  const configurationData = {
    supported_resolutions: ['1', '5', '10', '30', '1H', '6H', '12H', '1D'],
    supports_marks: true,
    supports_timescale_marks: true,
    supports_time: true,
  }


  const AddRecentData = async (data: any[]) => {
    
    let recentArray:any[] = [];
    const res = await getLastTransactionsLogsByTopic(
      lpTokenAddress.contractAddress, 
      lpTokenAddress.network
    );
    if (res != constant.NOT_FOUND_TOKEN) {
      let currentBaseReserve = 0;lpTokenAddress.token0_reserve;
      let currentQuoteReserve = 0;lpTokenAddress.token1_reserve;
      if (lpTokenAddress.tokenside == TokenSide.token0) {
        currentBaseReserve = lpTokenAddress.token0_reserve;
        currentQuoteReserve = lpTokenAddress.token1_reserve;
      } else {
        currentBaseReserve = lpTokenAddress.token1_reserve;
        currentQuoteReserve = lpTokenAddress.token0_reserve;
      }
      const currentTime = new Date(data[0].timeInterval.second.replace(" ", "T") + "Z");
      
      // console.log("reserve", currentBaseReserve, currentQuoteReserve);
      for (let index = res.length - 1; index > 0; index--){
        const value = res[index];
        const timeStamp = parseInt(value.timeStamp, 16) * 1000;
        if (timeStamp <= currentTime.getTime())
          break;

        const time = new Date(timeStamp).toISOString().replace("T", " ").slice(0, 19);
        let itemPrice = currentQuoteReserve / currentBaseReserve;
        const item = ConvertEventtoTransaction(value, lpTokenAddress);
        const new_item = {
          timeInterval:{
            second: time
          },
          isBarClosed:true,
          isLastBar:false,
          quoteAmount:item.quoteToken_amount,
          open:itemPrice,
          high:itemPrice,
          low:itemPrice,
          close:itemPrice
        }
        recentArray.push(new_item);
        if (item.buy_sell == "Buy") {
          currentBaseReserve += item.baseToken_amount;
          currentQuoteReserve -= item.quoteToken_amount;
        } else {
          currentBaseReserve -= item.baseToken_amount;
          currentQuoteReserve += item.quoteToken_amount;
        }
      }
      data.unshift(...recentArray);
    }
  
  }


  const feed = {
    onReady: async (callback: any) => {
      
      if (tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase() ||
        tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase()) {
        timeStampArr = await getSRGTimestamp(tokenData.contractAddress, tokenData.network);
      }
      setTimeout(() => callback(configurationData), 0)
    },
    searchSymbols: async (userInput: any, exchange: any, symbolType: any, onResultReadyCallback: any) => {
    },
    
    resolveSymbol: async (symbolName: any, onSymbolResolvedCallback: any, onResolveErrorCallback: any) => {

      let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      timezone=timezone.replace('_', ' ');
      const symbolInfo = {
        ticker: lpTokenAddress.name,
        name: lpTokenAddress.name,
        type: 'crypto',
        session: '24x7',        
        description: lpTokenAddress.symbol,
        locale: getLanguageFromURL() || 'en',
        exchange: "blockportal.app",
        minmov: 1,
        pricescale: 1000000,
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 3,
      }
      // eslint-disable-next-line no-console
      // console.log('[resolveSymbol]: Symbol resolved', symbolName);
      onSymbolResolvedCallback(symbolInfo)
    },
    getBars: async (
      symbolInfo: any,
      resolution: any,
      periodParams: any,
      onHistoryCallback: any,
      onErrorCallback: any,
    ) => {
      try {
        let bars: any = []
        let bar_data:any[] = [];
        let resolution_num = resolution;
        const CANDLE_FETCH_COUNT = 400;
        const { from, to, firstDataRequest } = periodParams

        if (lpTokenAddress.ownerToken == undefined || lpTokenAddress.ownerToken == "") {
          onHistoryCallback([], {
            noData: true,
          })
          return;
        }

        if (resolution == "1D") {
          resolution_num = 1440;
        }
        // console.log('getBars firstDataRequest', new Date(from * 1000).toISOString(), new Date(to * 1000).toISOString(),  firstDataRequest);
        // if (checksumAddress) {
        //   // setLoader(true);
          // if (!firstDataRequest) {
          //   // "noData" should be set if there is no data in the requested period.
          //   onHistoryCallback([], {
          //     noData: true,
          //   })
          //   return
          // }
        // }

        // console.log('from to', new Date(from * 1000).toISOString(), new Date(to * 1000).toISOString(), resolution);
        
        // console.log('lp info', lpTokenAddress.token0_reserve, lpTokenAddress.token1_reserve);

        if (tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() || 
            tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {

            const decimal = tokenData.network == constant.ETHEREUM_NETWORK ? 15 : 27;
            const volumeDecimal = tokenData.network == constant.ETHEREUM_NETWORK ? 6 : 18;
            const fromInd = priceData.findIndex((value:any) => parseInt(value.time._hex) < from);
            
            if (firstDataRequest) {
              priceData = [];
            } else if (!firstDataRequest && timeStampArr.length < 2000) {
              if (timeStampArr.length < 2000) {
                onHistoryCallback([], {
                  noData: true,
                })
              }
            }

            if (fromInd < 1) {
              const startInd = timeStampArr.length > 2000 ? to - CANDLE_FETCH_COUNT * resolution_num * 60 : timeStampArr[0];
              // console.log('from to', from, startInd, to);
              const txArr = await getSRGTx(tokenData.contractAddress, tokenData.network, startInd > from ? from : startInd,  to, timeStampArr);
              bar_data = txArr[0];
              const volume = txArr[1];
              priceData = bar_data.concat(priceData);
              bar_data?.forEach((value:any, index:number) => {
                const volumeInd = ethers.utils.formatEther(volume[index][0]._hex);
                if (index == bar_data.length - 1) {
                  const obj = {
                    time: parseInt(value.time) * 1000,
                    low: parseInt(value.low._hex) / Math.pow(10, decimal),
                    high: parseInt(value.high._hex) / Math.pow(10, decimal),
                    open: parseInt(value.open._hex) / Math.pow(10, decimal),
                    close: parseInt(value.close._hex) / Math.pow(10, decimal),
                    isBarClosed: false,
                    isLastBar: true,
                    volume: parseInt(volumeInd) / Math.pow(10, volumeDecimal),
                  }
                  bars = [...bars, obj];
                } else {
                  const obj = {
                    time: parseInt(value.time) * 1000,
                    low: parseInt(value.low._hex) / Math.pow(10, decimal),
                    high: parseInt(value.high._hex) / Math.pow(10, decimal),
                    open: parseInt(value.open._hex) / Math.pow(10, decimal),
                    close: parseInt(value.close._hex) / Math.pow(10, decimal),
                    isBarClosed: true,
                    isLastBar: false,
                    volume: parseInt(volumeInd) / Math.pow(10, volumeDecimal),
                  }
                  bars = [...bars, obj];
                }
              });
              
              if(bars.length > 0 && firstDataRequest) {
                lastBarsCache = bars[bars.length - 1];
                preReserve1 = lpTokenAddress.token1_reserve;  
              }
            }
        } else {
          if (firstDataRequest) {

            const current = new Date();
            const end = new Date(current.toUTCString()).toISOString().slice(0, 19);
            bar_data = await getLimitTimeHistoryData(
              lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token1_contractAddress : lpTokenAddress.token0_contractAddress, 
              lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token0_contractAddress : lpTokenAddress.token1_contractAddress, 
              lpTokenAddress.network,
              CANDLE_FETCH_COUNT,
              end,
              resolution_num * 60,
              tokenData.controller?.signal
            );     
            await AddRecentData(bar_data);
            bar_data = bar_data.reverse();
            priceData = bar_data;
          } else {
            let subData:any[] = [];
            let exist:boolean = false;
            const lastEle = priceData.at(0);
            const lastTime = new Date(lastEle.timeInterval.second.replace(" ", "T") + "Z");
            if (to >= lastTime.getTime() / 1000) {
              let fromIndex = 0;
              const toIndex = priceData.findIndex((value, index) => {
                const compareval = new Date(value.timeInterval.second.replace(" ", "T") + "Z").getTime();
                if (compareval > to) {
                  return index;
                }
              });
              if (from >= lastTime.getTime() / 1000) {
                exist = true;
                fromIndex = priceData.findIndex((value, index) => {
                  const compareval = new Date(value.timeInterval.second.replace(" ", "T") + "Z").getTime();
                  if (compareval > from) {
                    return index;
                  }
                });
                if (fromIndex > 1)
                  fromIndex = fromIndex - 1;
              }
              if (toIndex > 1) {
                subData = priceData.slice(fromIndex, toIndex - 1)
                subData = subData.reverse();
              }
            }
            if (!exist) {
              bar_data = await getLimitTimeHistoryData(
                lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token1_contractAddress : lpTokenAddress.token0_contractAddress, 
                lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token0_contractAddress : lpTokenAddress.token1_contractAddress, 
                lpTokenAddress.network,
                CANDLE_FETCH_COUNT / 2,
                lastTime.toISOString().slice(0, 19),
                resolution_num * 60,
                tokenData.controller?.signal
              );     
              if (bar_data.length == 0) {
                onHistoryCallback([], {
                  noData: true,
                })             
                return; 
              }
              bar_data = bar_data.concat(subData);  
              bar_data = bar_data.reverse();
              priceData = bar_data.concat(priceData);
            } else {
              bar_data = subData;
              bar_data = bar_data.reverse();
            }
          }
          let price = 1;
          const coin = coinPrice.find((coinToken:any) => coinToken.contractAddress.toLowerCase() + coinToken.network ==
                        lpTokenAddress.quoteCurrency_contractAddress! + lpTokenAddress.network);
          // // console.log('after before ', after, before);
  
          if (coin != undefined)
            price = coin.price;
  
          bar_data?.forEach((value:any)  => {
            const currentTime = new Date(value.timeInterval.second.replace(" ", "T") + "Z");
            const pre = bars.at(-1);
            if (pre == undefined || currentTime.getTime() != pre.time) {
              let open_price = 0.0;
              if(pre != undefined) {
                open_price = bars[bars.length -1].close;
              }
              const obj = {
                time: currentTime.getTime(),
                low: value.low * price,
                high: value.high * price,
                open: open_price == 0? (parseFloat(value.open) * price) : open_price,
                close: parseFloat(value.close) * price,
                isBarClosed: true,
                isLastBar: false,
                volume: value.quoteAmount * price,
              }
              bars = [...bars, obj]
            } else {
              const lastIndex = bars.length - 1;
              bars[lastIndex].close = parseFloat(value.close) * price;
              bars[lastIndex].high = Math.max(value.high * price, bars[lastIndex].high);
              bars[lastIndex].low = Math.min(value.low * price, bars[lastIndex].low);
              bars[lastIndex].volume += (value.quoteAmount * price);
            }
          });
          if(bars.length>0 && firstDataRequest) {
            lastBarsCache = bars[bars.length - 1];
            preReserve0 = lpTokenAddress.token0_reserve;
            preReserve1 = lpTokenAddress.token1_reserve;
            
          }
        }

        onHistoryCallback(bars, {
          noData: false,
        })
        // }
      } catch (error) {
        // console.log('[getBars]: Get error', error.message);
        onErrorCallback(error)
      }
    },
    subscribeBars: async (
      symbolInfo: any,
      resolution: any,
      onRealtimeCallback: any,
      subscribeUID: any,
      onResetCacheNeededCallback: any,
    ) => {
      currentResolutions = resolution
      const isSRG = tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ||
        tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase();
      const timeInterval = isSRG ? 1000 * 3 : 1000 * 1;
      myInterval = setInterval(async function () {
        const candleTime = new Date();
        const resolutionMapping: any = {
          '1': 60000,
          '5': 300000,
          '10': 600000,
          '15': 900000,
          '30': 1800000,
          '60': 3600000,
          '1H': 3600000,
          '1D': 24 * 3600000,
          '1W': 7 * 24 * 3600000,
          '1M': 30 * 24 * 3600000,
        }
        if (tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase() ||
           tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase()) {
            
          const currentReserve1 = lpTokenAddress.token1_reserve;
          if (currentReserve1 != preReserve1) {
            if (lastBarsCache === undefined) return;
            const time = new Date();
            const cuTime = makeTemplateDate(time, currentResolutions);
            const isNew = cuTime.getTime() - lastBarsCache.time >= resolutionMapping[currentResolutions]

            const temp = lastBarsCache;

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
              }
            ];
            const response = await multicallv2(SRGToken, reserveCalls, tokenData.network);
            
            const bnbPrice = response[1] / Math.pow(10, tokenData.network == constant.ETHEREUM_NETWORK ? 6 : 18);
            let currentPrice = response[0] / Math.pow(10, 9) * bnbPrice;
            let volume = (Math.abs(currentReserve1 - preReserve1)) * bnbPrice;

            if (isNew) {
              lastBarsCache.time = cuTime.getTime()
              lastBarsCache.open = temp.close
              lastBarsCache.high = currentPrice
              lastBarsCache.low = currentPrice
              lastBarsCache.close = currentPrice
              lastBarsCache.volume = volume;
              priceData = priceData.concat(lastBarsCache);
              lastBarsCache.isLastBar = false;
              lastBarsCache.isBarClosed = true;

            } else {
              if (lastBarsCache.low > currentPrice) {
                lastBarsCache.low = currentPrice
              }
              if (lastBarsCache.high < currentPrice) {
                lastBarsCache.high = currentPrice
              }
              lastBarsCache.close = currentPrice;
              lastBarsCache.volume += volume;
              lastBarsCache.isLastBar = true;
              lastBarsCache.isBarClosed = false;
            }
            onRealtimeCallback(lastBarsCache)
            
            preReserve1 = currentReserve1;
          }

        } else {
          const currentReserve0 = lpTokenAddress.token0_reserve;
          const currentReserve1 = lpTokenAddress.token1_reserve;
          if (preReserve0 != currentReserve0 || preReserve1 != currentReserve1) {
            // console.log('lpTokenAddress', lpTokenAddress);
            if (lastBarsCache === undefined) return
            const time = new Date();
            const cuTime = makeTemplateDate(time, currentResolutions);
            const isNew = cuTime.getTime() - lastBarsCache.time >= resolutionMapping[currentResolutions]
            // console.log('isNew', isNew, lastBarsCache);
            let price = 1;
            const coin = coinPrice.find((coinToken:any) => coinToken.contractAddress.toLowerCase() + coinToken.network ==
                          lpTokenAddress.quoteCurrency_contractAddress! + lpTokenAddress.network)
            if (coin != undefined)
              price = coin.price;

            const temp = lastBarsCache;
            let currentPrice = 0;

            let volume = 0;
            if (lpTokenAddress.tokenside == TokenSide.token0) {
              currentPrice = currentReserve1 / currentReserve0 * price;
              volume += (Math.abs(currentReserve1 - preReserve1)) * price
            } else {
              currentPrice = currentReserve0 / currentReserve1 * price;
              volume += (Math.abs(currentReserve0 - preReserve0)) * price
            }
            // console.log('bar should be updated', time.toUTCString(), cuTime, currentPrice, temp);
            if (isNew) {
              lastBarsCache.time = cuTime.getTime()
              lastBarsCache.open = temp.close
              lastBarsCache.high = currentPrice
              lastBarsCache.low = currentPrice
              lastBarsCache.close = currentPrice
              lastBarsCache.volume = volume;
              priceData = priceData.concat(lastBarsCache);
              lastBarsCache.isLastBar = false;
              lastBarsCache.isBarClosed = true;
            } else {
              if (lastBarsCache.low > currentPrice) {
                lastBarsCache.low = currentPrice
              }
              if (lastBarsCache.high < currentPrice) {
                lastBarsCache.high = currentPrice
              }
              lastBarsCache.close = currentPrice;
              lastBarsCache.volume += volume;
              lastBarsCache.isLastBar = true;
              lastBarsCache.isBarClosed = false;
            }
            onRealtimeCallback(lastBarsCache)
            preReserve0 = currentReserve0;
            preReserve1 = currentReserve1;
            // console.log('lastBarsCache', lastBarsCache);
          }
      }

      }, timeInterval)
       
    },
    unsubscribeBars: (subscriberUID: any) => {
      // console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID)

      clearInterval(myInterval)
      // console.log('[unsubscribeBars]: cleared')
    },
    getMarks: async(symbolInfo: any, from: number, to: number, onDataCallback: any, resolution: any) => {
      
      if (priceData == undefined || priceData.length == 0)
        return;
      if (showOrder) {
        const res = await getLPTransactionListFromWallet(address, tokenData.contractAddress, tokenData.network, resolution, tokenData.decimals);
        let Arr:any[] = [];
        if ( res != constant.NOT_FOUND_TOKEN && res.length > 0) {
          let id = 0;
          res.forEach((value: any, index: any) => {
            const tradeTime = new Date(value.time).toISOString().replace("T", " ").slice(0, -5) + " (UTC)";
            id ++;
            if (value.buy_sell == "buy") {
              const text = `Buy at ${tradeTime}`;
              const text1 = `Amount: ${value.amount}`;
              Arr.push({
                id: id,
                time: value.intervalTime / 1000,
                text: text + "    " + text1,
                color: 'green',
                minSize: 5
              })
            } else {
              const text = `Sell at ${tradeTime} \n\n` + 
                            `Amount: ${value.amount}`;
              Arr.push({
                id: id,
                time: value.intervalTime / 1000,
                text: text,
                color: 'red',
                minSize: 5
              })
            }
          })
        }
        
        onDataCallback(Arr);
      }
    },
    getTimescaleMarks: async(symbolInfo:any,startDate:any,endDate:any,onDataCallback:any,resolution:any) => {

      if (priceData == undefined || priceData.length == 0)
        return;
      if (showOrder) {
        const res = await getLPTransactionListFromWallet(address, tokenData.contractAddress, tokenData.network, resolution, tokenData.decimals);
        let Arr:any[] = [];
        if ( res != constant.NOT_FOUND_TOKEN && res.length > 0) {
          let id = 0;
          res.forEach((value: any, index: any) => {
            id ++;
            if (value.buy_sell == "buy") {
              Arr.push({
                id: id,
                time: value.intervalTime / 1000,
                color: 'green',
                label: 'Buy',
                minSize: 5
              })
            } else {
              Arr.push({
                id: id,
                time: value.intervalTime / 1000,
                color: 'red',
                label: 'Sell',
                minSize: 5
              })
            }
          })
        }
        onDataCallback(Arr);      
      }
    } 
  }
  // const tvWidget = null;
  //   React.useEffect(()=>{
  const getWidget = async (interval:any) => {
    
    let initInterval = '60' as ResolutionString;
    if (interval != undefined)
      initInterval = interval as ResolutionString;
    const widgetOptions: ChartingLibraryWidgetOptions = {
      // symbol: this.props.symbol as string,
      symbol: tokendetails.pair,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      //   datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(props.datafeedUrl),
      datafeed: feed,
      interval: initInterval as ChartingLibraryWidgetOptions['interval'],
      library_path: ChartContainerProps.libraryPath as string,
      container: 'dexAnalyzer_chart_container',
      locale: getLanguageFromURL() || 'en',
      theme: colorMode == "dark" ? 'Dark' : 'Light',
      charts_storage_url: ChartContainerProps.chartsStorageUrl,
      //   charts_storage_api_version: ChartContainerProps.chartsStorageApiVersion,
      client_id: ChartContainerProps.clientId,
      enabled_features: ["hide_left_toolbar_by_default"],
      disabled_features: ['header_compare', 'header_symbol_search'],
      user_id: ChartContainerProps.userId,
      fullscreen: ChartContainerProps.fullscreen,
      autosize: ChartContainerProps.autosize,
      studies_overrides: ChartContainerProps.studiesOverrides,
    }

    tvWidget = new widget(widgetOptions)
		tvWidget.onChartReady(() => {
      tvWidget.changeTheme(colorMode == "dark" ? 'Dark' : 'Light');
			tvWidget!.headerReady().then(() => {
				const button = tvWidget!.createButton();
				button.setAttribute('title', 'Click to show positions');
        button.setAttribute('style', "height:90%;display:flex;align-items:center;background:transparent");
				button.classList.add('apply-common-tooltip');
				button.addEventListener('click', async () => {
          const currentStatus = button.getAttribute('style');
          if (currentStatus.includes("background:#2a2e39") || currentStatus.includes("background:#f0f3fa")) {            
            tvWidget.activeChart().clearMarks();
            showOrder = false;
            button.setAttribute('style', "height:90%;display:flex;align-items:center;background:transparent");
          } else {
            if (colorMode == "dark")
              button.setAttribute('style', "height:90%;display:flex;align-items:center;background:#2a2e39");
            else
              button.setAttribute('style', "height:90%;display:flex;align-items:center;background:#f0f3fa");
            if (address != undefined && address != "") {
              tvWidget.activeChart().refreshMarks();
            }
            showOrder = true;
          }
        });
				button.innerHTML = 'My Trades';
			});
		});
  }
  
  React.useEffect(() => {
    const initLoad = async() => {
      
      lastBarsCache = undefined;
      const saveResolution = getCookie("chartInterval");
      getWidget(saveResolution)
      return(() => {
          return setCookie("chartInterval", currentResolutions);
      })
    }
    if (lpTokenAddress.contractAddress.length > 0) {
      initLoad();
    }
  }, [lpTokenAddress.contractAddress])

  React.useEffect(() => {
    lastBarsCache = undefined;
    const saveResolution = getCookie("chartInterval");
    getWidget(saveResolution)
    return(() => {
        return setCookie("chartInterval", currentResolutions);
    })
  }, [colorMode])

  React.useMemo(() => {
    // const loadTimestamp = async() => {
      
    //   if (tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.BSC.SRG.toLowerCase() ||
    //       tokenData.contractAddress.toLowerCase() == constant.WHITELIST_TOKENS.ETH.SRG.toLowerCase()) {
    //       timeStampArr = await getSRGTimestamp(tokenData.contractAddress, tokenData.network);
    //   }
    // }

    // loadTimestamp();
    
  }, [tokenData])

  return (
    <div style={{
      height:props.height, 
      pointerEvents:props.resize ? "none" : "inherit",
      userSelect: "none"
    }}>
      <div id={ChartContainerProps.containerId} style={{ height: "100%"}} />
    </div>
  )
}

export default ChartContainer
