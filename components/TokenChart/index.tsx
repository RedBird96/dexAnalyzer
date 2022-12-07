import React from 'react'
import { Box, position, useColorMode } from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import style from './TokenChart.module.css'
import {ResizerDark, ResizerLight} from '../../assests/icon'
const AdvancedRealTimeChart = 
  dynamic(import('react-ts-tradingview-widgets').
  then(mod => mod.AdvancedRealTimeChart), {ssr: false})

export default function TokenChart() {

  const { colorMode } = useColorMode()

  return (
    <Box className={style.tokenChart}>
        <AdvancedRealTimeChart
          theme={colorMode}
          width={"100%"}
          height={"100%"}
        />
      <Box style={{
        display:"flex",
        alignItems:"center", 
        marginTop:"1rem", 
        justifyContent:"center",
        }}
        width={"100%"}
        cursor={"row-resize"}
      >
        <ResizerLight/>
      </Box>
    </Box>
  );
}