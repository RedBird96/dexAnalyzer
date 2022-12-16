import React from 'react'
import { Box, position, useColorMode, useColorModeValue } from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import style from './TokenChart.module.css'
import {ResizerDark, ResizerLight} from '../../assests/icon'

const ChartContainer = dynamic(() => import("./ChartContainer"), { ssr: false })

export default function TokenChart() {

  const { colorMode } = useColorMode();
  const headerColor = useColorModeValue("#FFFFFF", "#1C1C1C");

  return (
    <Box className={style.tokenChart}>
      <ChartContainer />
      <Box 
        style={{
        display:"flex",
        alignItems:"center", 
        justifyContent:"center",
        }}
        width={"100%"}
        cursor={"row-resize"}
        bottom={"0rem"}
        height={"1rem"}
        backgroundColor={headerColor}
        //onMouseMove={}
      >
        <nav>
          <hr aria-orientation='horizontal' style={{width:"100%", height:"1px", color:"#313131"}}></hr>
        </nav>
        <ResizerLight/>
      </Box>
    </Box>
  );
}