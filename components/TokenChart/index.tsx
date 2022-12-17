import React from 'react'
import { Box, position, useColorMode, useColorModeValue } from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import style from './TokenChart.module.css'
import {ResizerDark, ResizerLight} from '../../assests/icon'

const ChartContainer = dynamic(() => import("./ChartContainer"), { ssr: false })

export default function TokenChart() {

  const { colorMode } = useColorMode();
  const [ dragPos, setDragPos ] = React.useState(0)
  const [ chartHeight, setChartHeight ] = React.useState(700)
  const headerColor = useColorModeValue("#FFFFFF", "#1C1C1C");

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setDragPos(e.pageY)
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (chartHeight + e.pageY - dragPos > 700) {
      setChartHeight(chartHeight + e.pageY - dragPos)
    } else {
      setChartHeight(700)
    }
  }
  
  return (
    <Box className={style.tokenChart}>
      <ChartContainer height={chartHeight}/>
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
        draggable={true}
        onDragStart={e=> handleDragStart(e)}
        onDragOver={e=>handleDrag(e)}
      >
        <nav>
          <hr aria-orientation='horizontal' style={{width:"100%", height:"1px", color:"#313131"}}></hr>
        </nav>
        <ResizerLight/>
      </Box>
    </Box>
  );
}