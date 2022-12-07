import React from 'react'
import { Box, position, useColorMode, useColorModeValue } from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import style from './TokenChart.module.css'
import {ResizerDark, ResizerLight} from '../../assests/icon'
const AdvancedRealTimeChart = 
  dynamic(import('react-ts-tradingview-widgets').
  then(mod => mod.AdvancedRealTimeChart), {ssr: false})

export default function TokenChart() {

  const { colorMode } = useColorMode();
  const headerColor = useColorModeValue("#FFFFFF", "#1C1C1C");

  return (
    <Box className={style.tokenChart}>
      <AdvancedRealTimeChart
        theme={colorMode}
        width={"100%"}
        height={"100%"}
      />
      <Box 
        style={{
        display:"flex",
        alignItems:"center", 
        marginTop:"1rem", 
        justifyContent:"center",
        }}
        position={"absolute"}
        width={"100%"}
        cursor={"row-resize"}
        bottom={"0rem"}
        height={"0.5rem"}
        backgroundColor={headerColor}
        //onMouseMove={}
      >
        <ResizerLight/>
      </Box>
    </Box>
  );
}