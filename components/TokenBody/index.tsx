import React, { useEffect, useRef, useState } from 'react'
import { Box, GridItem, calc, useColorModeValue } from "@chakra-ui/react"
import { ResizableBox } from 'react-resizable'
import dynamic from 'next/dynamic'
import TokenList from "../TokenList"
import TokenInfo from "../TokenInfo"
import MenuBar from "../MenuBar"
import TokenTransaction from "../TokenTransaction"
import WalletInfo from "../WalletInfo"
import style from './TokenBody.module.css'
import {ResizerDark, ResizerLight} from '../../assests/icon'
import { useTokenInfo } from '../../hooks'

const ChartContainer = dynamic(() => import("../ChartContainer"), { ssr: false })
const ResizePanel = dynamic(() => import('react-resize-panel'), { ssr: false });


export default function TokenBody() {
  
  const sidebarRef = useRef(null);
  const transactionRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const {tokenData} = useTokenInfo();
  const [height, setHeight] = useState(320);
  const [chartheight, setChartHeight] = useState(750);
  const resizeBgColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const hasWindow = typeof window !== 'undefined';
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  }

  useEffect(() => {
    if (hasWindow) {
      const handleResize = () => {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (tokenData !=undefined && tokenData.contractAddress != "")
      setChartHeight(sidebarRef.current.clientHeight - 320);
  }, [windowDimensions])

  const startResizing = React.useCallback((_mouseDownEvent: any) => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);


  const resize = React.useCallback(
    (mouseMoveEvent:MouseEventInit ) => {
      if (isResizing) {
        let resizeHeight = windowDimensions.height - mouseMoveEvent.clientY;
        if (resizeHeight < 320) {
          resizeHeight = 320;
        } else if (resizeHeight > 800){
          resizeHeight = 800;
        }
        setHeight(resizeHeight);
        setChartHeight(sidebarRef.current.clientHeight - resizeHeight);
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <main 
      className={style.tokenBody} 
    >
      <Box style={{
        display: "flex", 
        flexDirection: "row", 
        width: "21.7%"
      }}>
        <MenuBar/>
        <TokenList/>
      </Box>
      <nav>
        <hr aria-orientation='vertical' style={{width:"1px", color:"#313131"}}></hr>
      </nav>
      {
        tokenData != undefined && tokenData.contractAddress != "" ? 
        <Box style={{
          display: "flex", 
          flexDirection: "column", 
          width: "56.5%",
          height:"100%"
        }}>
          <TokenInfo/>  
          <Box 
          id="tradeMain"
          style={{
            display:"flex",
            flexDirection:"column",
            height:"100%"
          }}
          ref = {sidebarRef}
          >
            <Box
            position={"relative"}
            width={"100%"}
            height={"100%"}
            >
              <ChartContainer height = {chartheight} resize = {isResizing}/>
            </Box>
            <Box 
              position="relative"
              display="flex"
              height={height}
              maxHeight={"50rem"}
              minHeight={"20rem"}
              flexShrink={"0"}
              width={"100%"}
              ref = {transactionRef}
            >
              <TokenTransaction/>
              <Box
                position="absolute"
                height={"15px"}
                top={"-12px"}
                left={"0px"}
                cursor={"row-resize"}
                width={"100%"}
                backgroundColor={resizeBgColor}
                onMouseDown={startResizing}
              >
                <nav>
                  <hr aria-orientation='vertical' style={{width:"1px", color:"#313131"}}></hr>
                </nav>
                <Box
                  display="flex"
                  width={"100%"}
                  height={"100%"}
                  position={"relative"}
                  textAlign={"center"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  style={{
                    zIndex:99
                  }}
                >
                  <ResizerLight/>
                </Box>
              </Box>
            </Box>
          </Box>
          
        </Box>:
          <Box style={{
            display: "flex", 
            flexDirection: "column", 
            width: "56.5%",
            height:"100%",
            justifyContent:"center",
            alignItems:"center",
            backgroundColor: "#1C1C1C",
            color:"#FFFFFF"
          }}>
              Please search or select a token
          </Box>
      }
      
      <nav>
        <hr aria-orientation='vertical' style={{width:"1px", color:"#313131"}}></hr>
      </nav>
      <Box style={{
        display: "flex", 
        width: "21.8%"
      }}>
      <WalletInfo/>
      </Box>      
    </main>
  );
}