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
import { useLPTokenPrice, useLPTransaction } from '../../hooks'
import { getLimitTimeHistoryData } from '../../api/bitquery_graphql'
import { TokenSide } from '../../utils/type'
import { makeTemplateDate } from '../../utils'
import { getLastTransactionsLogsByTopic } from '../../api'
import { useStableCoinPrice } from '../../hooks/useStableCoinPrice'
import { ConvertEventtoTransaction } from '../TokenTransaction/module'
import * as constant from '../../utils/constant'
import { slice } from 'lodash'

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
  containerId: ChartingLibraryWidgetOptions['container_id']
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
  const {lpTokenPrice, lpTokenAddress} = useLPTokenPrice();
  const {coinPrice} = useStableCoinPrice();
  const [showOrder, setShowOrder] = React.useState<boolean>(false);
  const {transactionData, setTransactionData} = useLPTransaction();
  const checksumAddress = lpTokenAddress.contractAddress;
  let preReserve0 = 0;
  let preReserve1 = 0;

  let myInterval: any
  let currentResolutions: any
  const [tokendetails, setTokenDetails] = React.useState({
    pair: ' ',
  })
  let priceData: any[] = [];

  let lastBarsCache: any;

  const configurationData = {
    supported_resolutions: ['1', '5', '10', '30', '1H', '6H', '12H', '1D']
  }

  const feed = {
    onReady: (callback: any) => {
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
        description: lpTokenAddress.symbol,
        locale: getLanguageFromURL() || 'en',
        exchange: lpTokenAddress.tokenside == TokenSide.token0 ? lpTokenAddress.token0_name : lpTokenAddress.token1_name,
        minmov: 1,
        pricescale: 1000000,
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: false,
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
        const CANDLE_FETCH_COUNT = 400;
        const { from, to, firstDataRequest } = periodParams
        const after = new Date(from * 1000).toISOString();
        const before = new Date(to * 1000).toISOString();
        
        if (lpTokenAddress.ownerToken == undefined || lpTokenAddress.ownerToken == "") {
          onHistoryCallback([], {
            noData: true,
          })
          return;
        }

        // console.log('getBars firstDataRequest', new Date(from * 1000).toISOString(), new Date(to * 1000).toISOString(),  firstDataRequest);
        // if (checksumAddress) {
        //   // setLoader(true);
        //   if (!firstDataRequest) {
        //     // "noData" should be set if there is no data in the requested period.
        //     onHistoryCallback([], {
        //       noData: true,
        //     })
        //     return
        //   }
        // }

        // console.log('from to', new Date(from * 1000).toISOString(), new Date(to * 1000).toISOString(), resolution);
        
        
        if (firstDataRequest) {

          const current = new Date();
          const calcTime = new Date();
          calcTime.setMinutes(current.getMinutes() - CANDLE_FETCH_COUNT * resolution);
          const end = new Date(current.toUTCString()).toISOString().slice(0, 19);
          const start = new Date(calcTime.toUTCString()).toISOString().slice(0, 19);
          bar_data = await getLimitTimeHistoryData(
            lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token1_contractAddress : lpTokenAddress.token0_contractAddress, 
            lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token0_contractAddress : lpTokenAddress.token1_contractAddress, 
            lpTokenAddress.network,
            CANDLE_FETCH_COUNT,
            end,
            resolution * 60
          );     
          console.log('first time bar_data1:', bar_data);
          bar_data = bar_data.reverse();
          priceData = bar_data;
        } else {
          console.log('second time');
          console.log('second time: after before', from, to);
          let subData:any[] = [];
          let exist:boolean = false;
          const lastEle = priceData.at(0);
          const lastTime = new Date(lastEle.timeInterval.second + " UTC");
          console.log('second time: lastTime', lastTime.getTime() / 1000);
          if (to >= lastTime.getTime() / 1000) {
            let fromIndex = 0;
            const toIndex = priceData.findIndex((value, index) => {
              const compareval = new Date(value.timeInterval.second + " UTC").getTime();
              if (compareval > to) {
                return index;
              }
            });
            if (from >= lastTime.getTime() / 1000) {
              exist = true;
              fromIndex = priceData.findIndex((value, index) => {
                const compareval = new Date(value.timeInterval.second + " UTC").getTime();
                if (compareval > from) {
                  return index;
                }
              });
              if (fromIndex > 1)
                fromIndex = fromIndex - 1;
            }
            console.log('second time: from-to Index', fromIndex, toIndex);
            if (toIndex > 1) {
              subData = priceData.slice(fromIndex, toIndex - 1)
              subData = subData.reverse();
            }
          }
          console.log('second time: exist', exist);
          if (!exist) {
            bar_data = await getLimitTimeHistoryData(
              lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token1_contractAddress : lpTokenAddress.token0_contractAddress, 
              lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token0_contractAddress : lpTokenAddress.token1_contractAddress, 
              lpTokenAddress.network,
              CANDLE_FETCH_COUNT / 2,
              lastTime.toISOString().slice(0, 19),
              resolution * 60
            );     
            console.log('second time: bar_data', bar_data);
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
          console.log('second time: bar_data', bar_data);
        }
        console.log('priceData:', priceData);
        let price = 1;
        const coin = coinPrice.find((coinToken:any) => coinToken.contractAddress.toLowerCase() + coinToken.network ==
                      lpTokenAddress.quoteCurrency_contractAddress! + lpTokenAddress.network);
        // // console.log('after before ', after, before);

        // let beforeIndex = -1;
        // let afterIndex = -1;
        // if (priceData!=undefined) {
        //   const searchbefore = (before.replace('T', ' ')).slice(0, 19);
        //   const searchafter = (after.replace('T', ' ')).slice(0, 19);
        //   // console.log('search', searchafter, searchbefore);
        //   beforeIndex = priceData.findIndex(function(number) {
        //     return number.timeInterval.second < searchbefore
        //   });
        //   afterIndex = priceData.findIndex(function(number) {
        //     return number.timeInterval.second < searchafter
        //   });
        //   // console.log('after before index', beforeIndex, afterIndex);
        // }
        // if (beforeIndex != -1) {
        //   bar_data = priceData.slice(afterIndex == -1 ? 0 : beforeIndex, afterIndex);
        //   // console.log('bar_data', bar_data);
        // } else {
        //   priceData.splice(afterIndex, priceData.length - 1);
        //   bar_data = await getRangeHistoryData(
        //     lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token1_contractAddress : lpTokenAddress.token0_contractAddress, 
        //     lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token0_contractAddress : lpTokenAddress.token1_contractAddress, 
        //     lpTokenAddress.network,
        //     after,
        //     before,
        //     1
        //   );

        //   priceData = priceData.concat(bar_data);
        // }

        // // console.log('firstDataRequest bar_data.length', firstDataRequest, bar_data.length);
        // if (firstDataRequest && bar_data.length > 0) {
        //   const res = await getLastTransactionsLogsByTopic(
        //     lpTokenAddress.contractAddress, 
        //     lpTokenAddress.network
        //   );
        //   if (res != constant.NOT_FOUND_TOKEN) {
        //     let currentBaseReserve = lpTokenAddress.token0_reserve;
        //     let currentQuoteReserve = lpTokenAddress.token1_reserve;
        //     const utcTime = new Date();
        //     const currentTime = new Date(bar_data[0].timeInterval.second);
        //     utcTime.setUTCFullYear(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
        //     utcTime.setUTCHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
            
        //     // console.log("reserve", currentBaseReserve, currentQuoteReserve);
        //     for (let index = 0; index < res.length; index++){
        //       const value = res[index];
        //       const timeStamp = parseInt(value.timeStamp, 16) * 1000;
        //       const time = new Date(timeStamp).toISOString().replace("T", " ").slice(0, 19);
        //       // console.log("bar_data[0], new data time", timeStamp, utcTime.getTime(), );
        //       if (timeStamp <= utcTime.getTime())
        //         continue;
        //       let itemPrice = 0;
        //       if (lpTokenAddress.tokenside == TokenSide.token0) {
        //         itemPrice = currentQuoteReserve / currentBaseReserve;
        //       } else {
        //         itemPrice = currentBaseReserve / currentQuoteReserve;
        //       }
        //       const item = ConvertEventtoTransaction(value, lpTokenAddress);
        //       const new_item = {
        //         timeInterval:{
        //           second: time
        //         },
        //         isBarClosed:true,
        //         isLastBar:false,
        //         quoteAmount:item.quoteToken_amount,
        //         open:itemPrice,
        //         high:itemPrice,
        //         low:itemPrice,
        //         close:itemPrice
        //       }
        //       bar_data.unshift(new_item);
        //       if (item.buy_sell == "Buy") {
        //         currentBaseReserve += item.baseToken_amount;
        //         currentQuoteReserve -= item.quoteToken_amount;
        //       } else {
        //         currentBaseReserve -= item.baseToken_amount;
        //         currentQuoteReserve += item.quoteToken_amount;
        //       }
        //       // console.log('new_item', new_item);
        //     }
        //   }
        // }
        // // console.log('priceData', priceData);
        // // console.log('bar_data', bar_data);
        

        if (coin != undefined)
          price = coin.price;

        // if (bar_data.length == 0) {
        //     onHistoryCallback([], {
        //       noData: true,
        //     })          
        // } else {
        bar_data?.forEach((value:any, index:number)  => {
          const currentTime = new Date(value.timeInterval.second + " UTC");
          // console.log('currentTime', currentTime, utcTime);
          // const cuTime = makeTemplateDate(utcTime, resolution);
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
            // console.log('bars', bars);
            // if (i === bar_data.length - 1) {
            //   obj.isLastBar = true
            //   obj.isBarClosed = false
            // }
          } else {
            const lastIndex = bars.length - 1;
            bars[lastIndex].close = parseFloat(value.close) * price;
            bars[lastIndex].high = Math.max(value.high * price, bars[lastIndex].high);
            bars[lastIndex].low = Math.min(value.low * price, bars[lastIndex].low);
            bars[lastIndex].volume += (value.quoteAmount * price);
          }
        });
        if(bars.length>0) {
          lastBarsCache = bars[0];
          preReserve0 = lpTokenAddress.token0_reserve;
          preReserve1 = lpTokenAddress.token1_reserve;
        }

        console.log('bars', bars);
        onHistoryCallback(bars, {
          noData: false,
        })
        // }
      } catch (error) {
        // console.log('[getBars]: Get error', error.message);
        onErrorCallback(error)
      }
    },
    subscribeBars: (
      symbolInfo: any,
      resolution: any,
      onRealtimeCallback: any,
      subscribeUID: any,
      onResetCacheNeededCallback: any,
    ) => {
      return;
      currentResolutions = resolution
      myInterval = setInterval(async function () {
        const currentReserve0 = lpTokenAddress.token0_reserve;
        const currentReserve1 = lpTokenAddress.token1_reserve;
        if (preReserve0 != currentReserve0 || preReserve1 != currentReserve1) {
          console.log('bar should be updated');
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

          if (lastBarsCache === undefined) return
          const time = new Date();
          const isNew = new Date().getTime() - lastBarsCache.time >= resolutionMapping[currentResolutions]
          const cuTime = makeTemplateDate(time, resolution);
          
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
          if (isNew) {
            lastBarsCache.time = cuTime.getTime()
            lastBarsCache.open = temp.close
            lastBarsCache.high = currentPrice
            lastBarsCache.low = currentPrice
            lastBarsCache.close = currentPrice
            lastBarsCache.volume = volume;
            priceData = priceData.concat(lastBarsCache);
          } else {
            if (lastBarsCache.low > currentPrice) {
              lastBarsCache.low = currentPrice
            }
            if (lastBarsCache.high < currentPrice) {
              lastBarsCache.high = currentPrice
            }
            lastBarsCache.volume = volume;
            lastBarsCache.isLastBar = false;
            lastBarsCache.isBarClosed = true;
          }
          lastBarsCache.isLastBar = true;
          lastBarsCache.isBarClosed = false;
          onRealtimeCallback(lastBarsCache)
        }
        preReserve0 = currentReserve0;
        preReserve1 = currentReserve1;
      }, 1000 * 3)
        
    },
    unsubscribeBars: (subscriberUID: any) => {
      // console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID)

      clearInterval(myInterval)
      // console.log('[unsubscribeBars]: cleared')
    },
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
      container_id: ChartContainerProps.containerId as ChartingLibraryWidgetOptions['container_id'],
      library_path: ChartContainerProps.libraryPath as string,
      container: 'dexAnalyzer_chart_container',
      locale: getLanguageFromURL() || 'en',
      theme: colorMode == "dark" ? 'Dark' : 'Light',
      disabled_features: [
        'compare_symbol'
      ],
      charts_storage_url: ChartContainerProps.chartsStorageUrl,
      //   charts_storage_api_version: ChartContainerProps.chartsStorageApiVersion,
      client_id: ChartContainerProps.clientId,
      user_id: ChartContainerProps.userId,
      fullscreen: ChartContainerProps.fullscreen,
      autosize: ChartContainerProps.autosize,
      studies_overrides: ChartContainerProps.studiesOverrides,
    }

    tvWidget = new widget(widgetOptions)
		tvWidget.onChartReady(() => {
      
			tvWidget!.headerReady().then(() => {
				const button = tvWidget!.createButton();
				button.setAttribute('title', 'Click to show positions');
        button.setAttribute('style', "height:90%;display:flex;align-items:center;background:transparent");
				button.classList.add('apply-common-tooltip');
				button.addEventListener('click', () => {
          const currentStatus = button.getAttribute('style');
          if (currentStatus.includes("background:#2a2e39")) {
            button.setAttribute('style', "height:90%;display:flex;align-items:center;background:transparent");
          } else {
            button.setAttribute('style', "height:90%;display:flex;align-items:center;background:#2a2e39");
          }
        });
				button.innerHTML = 'Trade Show';
			});
		});
  }
  
  React.useEffect(() => {
    lastBarsCache = undefined;
    const saveResolution = getCookie("chartInterval");
    getWidget(saveResolution)
    return(() => {
        return setCookie("chartInterval", currentResolutions);
    })
  }, [lpTokenAddress.contractAddress])

  React.useEffect(() => {
    lastBarsCache = undefined;
    const saveResolution = getCookie("chartInterval");
    getWidget(saveResolution)
    return(() => {
        return setCookie("chartInterval", currentResolutions);
    })
  }, [colorMode])

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