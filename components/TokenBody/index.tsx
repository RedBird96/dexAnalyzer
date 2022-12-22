import React, { useRef, useState } from 'react'
import { Box, GridItem, calc } from "@chakra-ui/react"
import { ResizableBox } from 'react-resizable'
import dynamic from 'next/dynamic'
import TokenList from "../TokenList"
import TokenHeader from "../TokenHeader"
import TokenInfo from "../TokenInfo"
import MenuBar from "../MenuBar"
import TokenChart from "../TokenChart"
import TokenTransaction from "../TokenTransaction"
import WalletInfo from "../WalletInfo"
import style from './TokenBody.module.css'
import {ResizerDark, ResizerLight} from '../../assests/icon'

const ChartContainer = dynamic(() => import("../TokenChart/ChartContainer"), { ssr: false })
// const ResizePanel = dynamic(() => import('react-resize-panel'), { ssr: false });

export default function TokenBody() {
  
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [height, setHeight] = useState(400);

  const startResizing = React.useCallback((_mouseDownEvent: any) => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);


  const resize = React.useCallback(
    (mouseMoveEvent: { clientY: number }) => {
      if (isResizing && sidebarRef != null) {
        const main = document.getElementById("tradeMain");
        const rect = main?.getBoundingClientRect();
        const dragHeight = rect?.bottom! - mouseMoveEvent.clientY;
        console.log(mouseMoveEvent.clientY, rect?.bottom!, dragHeight);
        if (dragHeight < 400)
          setHeight(400);  
        else
          setHeight(dragHeight);
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
    <main className={style.tokenBody}>
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
      <Box style={{
        display: "flex", 
        flexDirection: "column", 
        width: "56.5%",
        height:"100%"
      }}>
        <TokenInfo/>  
          
        <Box 
        id="tradeMain"
        ref = {sidebarRef}
        style={{
          display:"flex",
          flexDirection:"column",
          height:"100%"
        }}
        // onMouseDown={(e) => e.preventDefault()}
        >
          <Box
          position={"relative"}
          width={"100%"}
          height={"100%"}
          >
            <ChartContainer/>
          </Box>
          <nav>
            <hr aria-orientation='vertical' style={{width:"1px", color:"#313131"}}></hr>
          </nav>
          <Box 
            position="relative"
            display="flex"
            height={height}
            maxHeight={"40rem"}
            minHeight={"25rem"}
            flexShrink={"0"}
            width={"100%"}
          >
            <TokenTransaction/>
            <Box
              position="absolute"
              height={"15px"}
              top={"0"}
              left={"0px"}
              cursor={"row-resize"}
              width={"100%"}
              // onMouseDown={startResizing}
            >
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
        
      </Box>
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