import React, { useEffect, useMemo, useRef, useState } from 'react'
import { 
  Box, 
  Drawer, 
  DrawerBody, 
  DrawerCloseButton, 
  DrawerContent, 
  DrawerHeader, 
  DrawerOverlay,
  useColorModeValue, 
  useDisclosure,
  useBreakpointValue,
  SimpleGrid,
  VStack,
  HStack
} from "@chakra-ui/react"
import dynamic from 'next/dynamic'
import TokenList from "../TokenList"
import TokenInfo from "../TokenInfo"
import MenuBar from "../MenuBar"
import TokenTransaction from "../TokenTransaction"
import WalletInfo from "../WalletInfo"
import style from './TokenBody.module.css'
import { ResizerLight, SiteLogo, SiteLogoMini, TransactionExpandDown, TransactionExpandUp} from '../../assests/icon'
import { useTokenInfo } from '../../hooks'
import { PlayMode } from '../../utils/type';
import useSize from '../../hooks/useSize'
import { SCREEN2XL_SIZE, SCREENMD_SIZE, SCREENNXL_SIZE, SCREENSM_SIZE } from '../../utils/constant'
import TokenAds from '../AdTokens'
import Card from '../Card/card'

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
  const resizeBgColor = useColorModeValue("#FFFFFF", "#17212B");
  const emptyBgColor = useColorModeValue('#FFFFFF', '#182633');
  const borderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const boxBg = useColorModeValue("white", "navy.800");
  const { isOpen:isMobileTransctionOpen, onOpen:onMobileTransactionOpen, onClose:onMobileTransactionClose } = useDisclosure();
  const firstField = React.useRef()
  // const breakPoint = useBreakpointValue({base:1920,sm:320, '2sm':380, md:768, lg:960, xl:1200, '2xl':1600, '3xl':1920}, {ssr:false})
  // console.log('breakPoint', breakPoint);
  useEffect(() => {
    if (tokenData != undefined && address != tokenData.contractAddress && isOpen)
      onClose();
  }, [address])

  useEffect(() => {
    if (isOpen && windowDimensions.width > SCREEN2XL_SIZE) {
      onClose();
    }
    if (tokenData !=undefined && tokenData.contractAddress != ""){
      if (windowDimensions.width < SCREENNXL_SIZE){
        setHeight(130);
        setChartHeight(sidebarRef.current.clientHeight - 130);
      }
      else{
        setHeight(200);
        setChartHeight(sidebarRef.current.clientHeight - 200);
      }
    }
  }, [windowDimensions, tokenData, sidebarRef])

  const tokenInfoBody = useMemo(() => {
    return (
      <TokenInfo 
        tokenData={tokenData}
      />
    )
  }, [tokenData])

  const tokenTransactionBody = useMemo(() => {
    return (
      <TokenTransaction/>
    )
  }, [tokenData])

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
          if (resizeHeight < 130) {
            resizeHeight = 130;
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
      <MenuBar
        selectMode={PlayMode.Trade}
        onOpen = {() => {if (windowDimensions.width > SCREENSM_SIZE) {onOpen()}}}
      />      

      <VStack p = "20px" display={'flex'} flexDirection={'column'} w={'100%'}>
        <TokenAds/>
        
        <HStack spacing={'10px'} h={'100%'} w={'100%'}>
          <TokenList
            network = {network}
            address = {address}
          />

          <Card p={'0px'} paddingTop={'10px'} paddingBottom={'10px'} h={'100%'} w={'100%'}>
          {
            tokenData != undefined && tokenData.contractAddress != "" ? 
            <Box style={{
              display: "flex", 
              flexDirection: "column", 
              width: "100%",
              height:"100%"
            }}>
              {tokenInfoBody}
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
                  {tokenTransactionBody}
                  {windowDimensions.width > SCREENSM_SIZE ?
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
                    </Box> :
                    <Box
                      position="absolute"
                      height={"20px"}
                      top={"-12px"}
                      left={"0px"}
                      cursor={"row-resize"}
                      width={"100%"}
                      onClick={onMobileTransactionOpen}
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
                      >
                          <TransactionExpandUp/>
                      </Box>
                    </Box>
                  }
                  
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
                backgroundColor: emptyBgColor,
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
          </Card>

          <WalletInfo
            tradeVisible = {true}
            hoverMenu = {false}
          />          
        </HStack>
      </VStack>

      {/* {
        (windowDimensions.width > SCREENSM_SIZE || tokenData == undefined || tokenData.contractAddress == "") && 
        <>
          {
            windowDimensions.width > SCREENSM_SIZE && 
            <MenuBar
              selectMode={PlayMode.Trade}
              onOpen = {() => {if (windowDimensions.width > SCREENSM_SIZE) {onOpen()}}}
            />
          }
          {
            ((windowDimensions.width > SCREENSM_SIZE && (tokenData == undefined || tokenData.contractAddress == "")) || windowDimensions.width > SCREEN2XL_SIZE) &&
            <Box 
              borderRight={"1px"}
              borderRightColor = {borderColorMode}
              minW={{'sm':470}}
              display={{'sm':'block'}}
            >
              <TokenList
                network = {network}
                address = {address}
              />
            </Box>
          }
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

      <Drawer
        isOpen={isMobileTransctionOpen}
        placement = 'bottom'
        onClose={onMobileTransactionClose}
        initialFocusRef={firstField}
        isFullHeight = {false}
      >
        <DrawerOverlay/>
        <DrawerContent height={"27rem"} >
          <DrawerBody p = {0} bg = {resizeBgColor}>
          <Box
            display={"flex"}
            position={"relative"}
            justifyContent={"center"}
            paddingTop = {"1rem"}
            height={"27rem"}
          >
            {tokenTransactionBody}
            <Box
              position={"absolute"}
              top={"0px"}
              left={"0px"}
              width={"100%"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              onClick={onMobileTransactionClose}
            >
                <TransactionExpandDown/>
            </Box>
          </Box>
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
          {tokenInfoBody}
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
              {tokenTransactionBody}
              {windowDimensions.width > SCREENSM_SIZE ?
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
                </Box> :
                <Box
                  position="absolute"
                  height={"20px"}
                  top={"-12px"}
                  left={"0px"}
                  cursor={"row-resize"}
                  width={"100%"}
                  backgroundColor={resizeBgColor}
                  onClick={onMobileTransactionOpen}
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
                      <TransactionExpandUp/>
                  </Box>
                </Box>
              }
              
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
      </Box>        */}
    </main>
  );
}