/* eslint-disable */
import * as React from 'react'
import { useColorMode } from "@chakra-ui/react"
import {
  widget,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  IChartingLibraryWidget,
  ResolutionString,
} from '../../../api/charting_library'
import axios from 'axios'
import { getUnixTime, startOfHour, Duration, sub } from 'date-fns'
import fetchTokenPriceData from '../../../api/priceDataforChart'
import { useLPTokenPrice, useLPTransaction } from '../../../hooks'
import { getRangeHistoryData } from '../../../api/bitquery_graphql'
import * as constant from '../../../utils/constant'
import { LPTokenPair, TokenSide } from '../../../utils/type'
import { makeTemplateDate } from '../../../utils'
import { getLastTransactionsLogsByTopic } from '../../../api'

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
}

const ChartContainerProps = {
  symbol: 'AAPL',
  interval: 'H' as ResolutionString,
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
  const {lpTokenPrice, lpTokenAddress ,setLPTokenAddress} = useLPTokenPrice();
  const {setTransactionData} = useLPTransaction();
  const checksumAddress = lpTokenAddress.contractAddress;

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
        const { from, to, firstDataRequest } = periodParams
        
        if (lpTokenAddress.ownerToken == undefined || lpTokenAddress.ownerToken == "") {
          onHistoryCallback([], {
            noData: true,
          })
          return;
        }

        console.log('getBars firstDataRequest', new Date(from * 1000).toISOString(), new Date(to * 1000).toISOString(),  firstDataRequest);
        if (checksumAddress) {
          // setLoader(true);
          if (!firstDataRequest) {
            // "noData" should be set if there is no data in the requested period.
            onHistoryCallback([], {
              noData: true,
            })
            return
          }
        }

        // console.log('from to', new Date(from * 1000).toISOString(), new Date(to * 1000).toISOString(), resolution);
        let bar_data;
        const after = new Date(from * 1000).toISOString();
        const before = new Date(to * 1000).toISOString();
        
        // console.log('after before ', after, before);

        let beforeIndex = -1;
        let afterIndex = -1;
        if (priceData!=undefined) {
          const searchbefore = (before.replace('T', ' ')).slice(0, 19);
          const searchafter = (after.replace('T', ' ')).slice(0, 19);
          // console.log('search', searchafter, searchbefore);
          beforeIndex = priceData.findIndex(function(number) {
            return number.timeInterval.second < searchbefore
          });
          afterIndex = priceData.findIndex(function(number) {
            return number.timeInterval.second < searchafter
          });
          // console.log('after before index', beforeIndex, afterIndex);
        }
        if (beforeIndex != -1) {
          bar_data = priceData.slice(afterIndex == -1 ? 0 : afterIndex, beforeIndex);
        } else {
          if (afterIndex != -1) {
            priceData.splice(afterIndex, priceData.length - 1);
          }
          bar_data = await getRangeHistoryData(
            lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token1_contractAddress : lpTokenAddress.token0_contractAddress, 
            lpTokenAddress.tokenside == TokenSide.token1 ? lpTokenAddress.token0_contractAddress : lpTokenAddress.token1_contractAddress, 
            lpTokenAddress.network,
            after,
            before,
            1
          );
          priceData = priceData.concat(bar_data);
        }

        console.log('priceData', priceData);
        // console.log('bar_data', bar_data);
        bar_data = bar_data.reverse()

        bar_data?.forEach((value:any)  => {
          const currentTime = new Date(value.timeInterval.second);
          const cuTime = makeTemplateDate(currentTime, resolution);
          const pre = bars.at(-1);
          if (pre == undefined || cuTime.getTime() != pre.time) {
            let open_price = 0.0;
            if(pre != undefined) {
              open_price = bars[bars.length -1].close;
            }
            const obj = {
              time: cuTime.getTime(),
              low: value.low,
              high: value.high,
              open: open_price == 0? parseFloat(value.open) : open_price,
              close: parseFloat(value.close),
              isBarClosed: true,
              isLastBar: false,
              volume: value.quoteAmount,
            }
            bars = [...bars, obj]
            // if (i === bar_data.length - 1) {
            //   obj.isLastBar = true
            //   obj.isBarClosed = false
            // }
          } else {
            const lastIndex = bars.length - 1;
            bars[lastIndex].close = parseFloat(value.close);
            bars[lastIndex].high = Math.max(value.high, bars[lastIndex].high);
            bars[lastIndex].low = Math.min(value.low, bars[lastIndex].low);
            bars[lastIndex].volume += value.quoteAmount;
          }
        });
        if(bars.length>0)
          lastBarsCache = bars[bars.length - 1];
        
        onHistoryCallback(bars, {
          noData: false,
        })
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
      // console.log('subscribe', lpTokenAddress, lpTokenPrice);
      currentResolutions = resolution
      myInterval = setInterval(async function () {
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
        const isNew = new Date().getTime() - lastBarsCache.time >= resolutionMapping[currentResolutions]

        lastBarsCache.close = lpTokenPrice;
        if (isNew) {
          lastBarsCache.time = new Date().getTime()
          lastBarsCache.open = lastBarsCache.close
          lastBarsCache.high = lastBarsCache.close
          lastBarsCache.low = lastBarsCache.close
          priceData = priceData.concat(lastBarsCache);
        } else {
          if (lastBarsCache.low > lastBarsCache.close) {
            lastBarsCache.low = lastBarsCache.close
          }
          if (lastBarsCache.high < lastBarsCache.close) {
            lastBarsCache.high = lastBarsCache.close
          }
        }
        onRealtimeCallback(lastBarsCache)
      }, 1000 * 1)
    },
    unsubscribeBars: (subscriberUID: any) => {
      // console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID)

      clearInterval(myInterval)
      // console.log('[unsubscribeBars]: cleared')
    },
  }
  // const tvWidget = null;
  //   React.useEffect(()=>{
  const getWidget = async () => {
    
    const widgetOptions: ChartingLibraryWidgetOptions = {
      // symbol: this.props.symbol as string,
      symbol: tokendetails.pair,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      //   datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(props.datafeedUrl),
      datafeed: feed,
      interval: ChartContainerProps.interval as ChartingLibraryWidgetOptions['interval'],
      container_id: ChartContainerProps.containerId as ChartingLibraryWidgetOptions['container_id'],
      library_path: ChartContainerProps.libraryPath as string,
      container: 'dexAnalyzer_chart_container',
      locale: getLanguageFromURL() || 'en',
      theme: colorMode == "dark" ? 'Dark' : 'Light',
      disabled_features: ['use_localstorage_for_settings'],
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
				button.setAttribute('title', 'Click to show a position');
				button.classList.add('apply-common-tooltip');
				// button.addEventListener('click', () => tvWidget!.showNoticeDialog({
				// 		title: 'Notification',
				// 		body: 'Show Trade positions',
				// 		callback: () => {
				// 			console.log('Noticed!');
				// 		},
				// 	}));
				button.innerHTML = 'Trade Show';
			});
		});
  }
  
  React.useEffect(() => {
    lastBarsCache = undefined;
    getWidget()
  }, [lpTokenAddress.contractAddress])

  React.useEffect(() => {
    lastBarsCache = undefined;
    getWidget()
  }, [colorMode])

  return (
    <div style={{width: "100%", height: "100%"}}>
      <div id={ChartContainerProps.containerId} style={{ height: '100%'}} />
    </div>
  )
}

export default ChartContainer