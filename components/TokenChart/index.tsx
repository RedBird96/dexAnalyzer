import React from 'react'
import { Box } from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import style from './TokenChart.module.css'
const AdvancedRealTimeChart = 
  dynamic(import('react-ts-tradingview-widgets').
  then(mod => mod.AdvancedRealTimeChart), {ssr: false})

export default function TokenChart() {
  return (
    <Box className={style.tokenChart}>
      <AdvancedRealTimeChart
        theme='light'
        width={"100%"}
        height={"100%"}
      />
    </Box>
  );
}