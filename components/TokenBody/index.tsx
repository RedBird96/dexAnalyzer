import React, { useEffect, useRef, useState } from 'react'
import { Box, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, useColorModeValue, useDisclosure } from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import TokenList from "../TokenList"
import TokenInfo from "../TokenInfo"
import MenuBar from "../MenuBar"
import TokenTransaction from "../TokenTransaction"
import WalletInfo from "../WalletInfo"
import style from './TokenBody.module.css'
import { ResizerLight, SiteLogo, SiteLogoMini} from '../../assests/icon'
import { useTokenInfo } from '../../hooks'
import { PlayMode } from '../../utils/type';
import useSize from '../../hooks/useSize'
import { SCREEN2XL_SIZE, SCREENNXL_SIZE, SCREENSM_SIZE } from '../../utils/constant'

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
  const [height, setHeight] = useState(200);
  const [chartheight, setChartHeight] = useState(0);
  const resizeBgColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const borderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const firstField = React.useRef()

  useEffect(() => {
    if (tokenData != undefined && address != tokenData.contractAddress && isOpen)
      onClose();
  }, [address])
  useEffect(() => {
    if (isOpen && windowDimensions.width > SCREEN2XL_SIZE) {
      onClose();
    }
    if (tokenData !=undefined && tokenData.contractAddress != ""){
      if (windowDimensions.width < SCREENNXL_SIZE)
        setChartHeight(windowDimensions.height - 290);
      else
        setChartHeight(windowDimensions.height - 420);
    }
  }, [windowDimensions, tokenData])

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
        if (windowDimensions.width < SCREENNXL_SIZE) {
          if (resizeHeight < 110) {
            resizeHeight = 110;
          } else if (resizeHeight > 800){
            resizeHeight = 800;
          }
        } else {
          if (resizeHeight < 200) {
            resizeHeight = 200;
          } else if (resizeHeight > 800){
            resizeHeight = 800;
          }          
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
    window.addEventListener("touchmove", resize);
    window.addEventListener("touchend", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", resize);
      window.removeEventListener("touchend", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <main 
      className={style.tokenBody} 
    >
      {
        (windowDimensions.width > SCREENSM_SIZE || tokenData == undefined || tokenData.contractAddress == "") && 
        <>
          <MenuBar
            selectMode={PlayMode.Trade}
            onOpen = {() => {if (windowDimensions.width > SCREENSM_SIZE) {onOpen()}}}
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
        isOpen={isOpen}
        placement = 'left'
        onClose={onClose}
        initialFocusRef={firstField}
        isFullHeight = {false}
      >
        <DrawerOverlay/>
        <DrawerContent minW={{sm:380}}  backgroundColor={resizeBgColor}>
          <DrawerHeader paddingLeft={"10px"}>
            <Box display={"flex"} flexDirection={"row"} alignItems={"center"} height={"2rem"}>
              <SiteLogoMini/>
              <p className={style.logo}>BlockPortal</p>
            </Box>
          </DrawerHeader>
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
              <ChartContainer height = {chartheight - 10} resize = {isResizing}/>
            </Box>
            <Box 
              position="relative"
              display="flex"
              flexDirection={"column"}
              height={height}
              maxHeight={"50rem"}
              minHeight={windowDimensions.width < SCREENNXL_SIZE ? "5rem" : "12rem"}
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
                onPointerDown={startResizing}
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
            {
              windowDimensions.width < SCREENSM_SIZE ?
              <TokenList
                network = {network}
                address = {address}
              /> :
              <p>
                Please search or select a token
              </p>
            }
              
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
          hoverMenu = {false}
        />
      </Box>       
    </main>
  );
}