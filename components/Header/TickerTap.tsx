import { useColorMode } from '@chakra-ui/react';
import { TickerTape } from "react-ts-tradingview-widgets";
import { useEffect } from 'react';
import useSize from '../../hooks/useSize';
import { SCREEN2XL_SIZE } from '../../utils/constant';

export default function StockSnippet({keyValue}:{keyValue:string}) {
  const colorMode = useColorMode();
  const windowDimensions = useSize();
  const wrapperStyle = {
      width: windowDimensions.width > SCREEN2XL_SIZE ? "70%" : "80%",
      height: "100%",
      marginLeft: windowDimensions.width > SCREEN2XL_SIZE ? "7rem" : "2rem",
      paddingTop: "0.5rem",
      colorScheme: "none"
  }

  const symbols = [
    {
      "proName": "BITSTAMP:BTCUSD",
      "title": "Bitcoin"
    }, {
      "proName": "BITSTAMP:ETHUSD",
      "title": "Ethereum"
    }, {
      "proName": "BINANCE:BNBUSD",
      "title": "Binance"
    }, {
      "proName": "BITSTAMP:XRPUSD",
      "title": "Ripple"
    }, {
      "proName": "COINBASE:ADAUSD",
      "title": "Cardano"
    }, {
      "proName": "BINANCE:MATICUSD",
      "title": "Polygon"
    },{
      "proName": "KRAKEN:TRXUSD",
      "title": "Tron"
    },{
      "proName": "BINANCE:AVAXUSD",
      "title": "Avalanche"
    },{
      "proName": "COINBASE:LINKUSD",
      "title": "Chainlink"
    },{
      "proName": "BINANCE:DOGEUSD",
      "title": "Doge"
    },{
      "proName": "COINBASE:SHIBUSD",
      "title": "Shiba Inu"
    }, {
      "proName": "COINBASE:SOLUSD",
      "title": "Solana"
    }];

  useEffect(() => {
    const widget = document.getElementById("tradingview_widget_wrapper");
    if (widget != null) {
      const comment = widget.lastChild;
      widget.removeChild(comment);
    }
  }, [])

  return (
      <div id={`tradingview-wrapper`} className="col-12 col-md-5 col-lg-4 d-sm-block" style={wrapperStyle}>
          <TickerTape colorTheme={colorMode.colorMode} isTransparent={true} symbols={symbols} largeChartUrl=""/>
      </div>
  )
}
