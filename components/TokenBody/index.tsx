import React, { useEffect, useRef, useState } from 'react'
import { Box, Drawer, DrawerBody, DrawerContent, DrawerOverlay, useColorModeValue, useDisclosure } from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import TokenList from "../TokenList"
import TokenInfo from "../TokenInfo"
import MenuBar from "../MenuBar"
import TokenTransaction from "../TokenTransaction"
import WalletInfo from "../WalletInfo"
import style from './TokenBody.module.css'
import { ResizerLight} from '../../assests/icon'
import { useTokenInfo } from '../../hooks'
import { PlayMode } from '../../utils/type';
import useSize from '../../hooks/useSize'
import { SCREEN2XL_SIZE, SCREENSM_SIZE } from '../../utils/constant'

const ChartContainer = dynamic(() => import("../ChartContainer"), { ssr: false })

export default function TokenBody({
  network,
  address
}:{
  network: string,
  address: string
}) {
  
  const sidebarRef = useRef(null);
  const transactionRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const {tokenData} = useTokenInfo();
  const windowDimensions = useSize();
  const [height, setHeight] = useState(320);
  const [chartheight, setChartHeight] = useState(0);
  const resizeBgColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const borderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showSidebar, setShowSideBar] = useState(false);
  const firstField = React.useRef()

  useEffect(() => {
    if (isOpen && windowDimensions.width > SCREEN2XL_SIZE) {
      onClose();
    }
    console.log('windowDimensions.height', windowDimensions.height);
    if (tokenData !=undefined && tokenData.contractAddress != ""){
      if (windowDimensions.width < SCREENSM_SIZE)
        setChartHeight(windowDimensions.height - 525);
      else
        setChartHeight(windowDimensions.height - 540);
    }
  }, [windowDimensions, tokenData])

  const startResizing = React.useCallback((_mouseDownEvent: any) => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleShowTrade = (triggerTradeShow: boolean) => {
    setShowSideBar(triggerTradeShow);
  }  

  const resize = React.useCallback(
    (mouseMoveEvent:MouseEventInit ) => {
      if (isResizing) {
        let resizeHeight = windowDimensions.height - mouseMoveEvent.clientY;
        console.log('resizeHeight', resizeHeight);
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

  console.log('chartheight', chartheight);
  return (
    <main 
      className={style.tokenBody} 
    >
      {
        (windowDimensions.width > SCREENSM_SIZE || tokenData == undefined || tokenData.contractAddress == "") && 
        <>
          <MenuBar
            selectMode={PlayMode.Trade}
            onOpen = {onOpen}
          />
          <Box 
            borderRight={"1px"}
            borderRightColor = {borderColorMode}
            minW={{'2xl':470}}
            display={{base:'none', '2xl':'block'}}
          >
            <TokenList
              network = {network}
              address = {address}
            />
          </Box>
        </>
      }

      <Drawer
        isOpen={showSidebar}
        placement = 'left'
        onClose={onClose}
        initialFocusRef={firstField}
        isFullHeight = {false}
      >
        <DrawerOverlay/>
        <DrawerContent minW={{sm:470}} >
          <DrawerBody p = {0}>
            <Box
              display={"flex"}
              flexDirection={"row"}
              width={"100%"}
              height={"100%"}
            >
              <MenuBar
                selectMode={PlayMode.Trade}
                onOpen = {onOpen}
              />
              <Box 
                borderRight={"1px"}
                borderRightColor = {borderColorMode}
                minW={{'2xl':470}}
                display={{base:'none', '2xl':'block'}}
              >
                <TokenList
                  network = {network}
                  address = {address}
                />
            </Box>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>      

      <Drawer
        isOpen={isOpen}
        placement = 'left'
        onClose={onClose}
        initialFocusRef={firstField}
        isFullHeight = {false}
      >
        <DrawerOverlay/>
        <DrawerContent minW={{sm:470}} >
          <DrawerBody p = {0}>
            <TokenList
              network = {network}
              address = {address}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>            

      {
        tokenData != undefined && tokenData.contractAddress != "" ? 
        <Box style={{
          display: "flex", 
          flexDirection: "column", 
          width: "100%",
          height:"100%"
        }}>
          <TokenInfo
            triggerSidebar = {handleShowTrade}
          />
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
              <ChartContainer height = {chartheight - 10} resize = {isResizing}/>
            </Box>
            <Box 
              position="relative"
              display="flex"
              flexDirection={"column"}
              height={height}
              maxHeight={"50rem"}
              minHeight={windowDimensions.width < SCREENSM_SIZE ? "5rem" : "10rem"}
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
                  borderTop={"1px"}
                  borderTopColor = {borderColorMode}
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
            width: "100%",
            height:"100%",
            justifyContent:"center",
            alignItems:"center",
            backgroundColor: resizeBgColor,
            fontSize : windowDimensions.width < SCREENSM_SIZE ? "0.8rem" : "1rem"
          }}>
              Please search or select a token
          </Box>
      }
      
      <Box 
      borderLeft={"1px"}
      borderLeftColor = {borderColorMode}
      minW = {{xl:560}}
      display = {{base:'none', xl:'block'}}
      >
        <WalletInfo
          tradeVisible = {true}
        />
      </Box>       
    </main>
  );
}