import React from 'react'
import { Box, useColorModeValue } from "@chakra-ui/react"
import style from './MenuBar.module.css'
import {GameMenuBar, GameMenuBarMini, TopMenuBar, TopMenuBarMini, ExpandMiniIcon} from '../../assests/icon'
import {TradeMenuBar, TradeMenuBarMini,ExpandIcon} from '../../assests/icon'
import { PlayMode } from '../../utils/type'
import Link from 'next/link'
import { SCREEN2XL_SIZE, SCREENNXL_SIZE, SCREENSM_SIZE } from '../../utils/constant'
import useSize from '../../hooks/useSize'
import { useTokenInfo } from '../../hooks'

export default function MenuBar({
  selectMode,
  onOpen
}:{
  selectMode: PlayMode,
  onOpen: () => void
}) {

  const {tokenData} = useTokenInfo();
  const windowDimensions = useSize();
  const menuClass = useColorModeValue(
    style.menuBar + " " + style.menuBarLight,
    style.menuBar + " " + style.menuBarDark
  );
  const chartSelectColor = useColorModeValue("#0067C6", "#2F2F2F");

  const onMenuClick = () => {
    const hasWindow = typeof window !== 'undefined';
    const width = hasWindow ? window.innerWidth : null;
    if ( width < SCREEN2XL_SIZE && selectMode == PlayMode.Trade && onOpen != null)
      onOpen();
  }

  return (
    <Box className={menuClass}>
      <Box style={{
        display: "flex", 
        justifyContent:"center", 
        height: windowDimensions.width > SCREENNXL_SIZE ? "4.8rem" : "63px", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column",
        width:"100%",
        alignItems:"center",
      }}
      _hover={{bg:chartSelectColor}}
      onClick = {onMenuClick}
      >
        {
          (tokenData == undefined || tokenData.contractAddress == "" || onOpen == null || windowDimensions.width > SCREEN2XL_SIZE) ? windowDimensions.width < SCREENSM_SIZE ? <TopMenuBarMini/> : <TopMenuBar/> : 
          windowDimensions.width < SCREENNXL_SIZE ? <ExpandMiniIcon/> : <ExpandIcon/>
        }
        
      </Box>
      <Box style={{
        display: "flex", 
        justifyContent:"center", 
        height: windowDimensions.width < SCREENSM_SIZE ? "3.5rem" : windowDimensions.width < SCREENNXL_SIZE ? "65px" : "5rem", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column",
        width:"100%",
        alignItems:"center"
        }}
        _hover={{bg:chartSelectColor}}
        background = {selectMode === PlayMode.Trade ? chartSelectColor : "transparent"}
      >
        <Link href = {'/trade'}>
            <Box display={"flex"} width={windowDimensions.width < SCREENSM_SIZE ? "2.5rem" : windowDimensions.width < SCREENNXL_SIZE ? "3rem" : "4rem"}>
            {
              <TradeMenuBar/>
            }
            </Box>
        </Link>
      </Box>
      <Box style={{
        display: "flex", 
        justifyContent:"center", 
        height: windowDimensions.width < SCREENSM_SIZE ? "3.5rem" : windowDimensions.width < SCREENNXL_SIZE ? "65px" : "5rem", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column",
        width:"100%",
        alignItems:"center"
        }}
        _hover={{bg:chartSelectColor}}
        background = {selectMode === PlayMode.Game ? chartSelectColor : "transparent"}
      >
        <Link href = {'/game'}>
          <Box display={"flex"} width={windowDimensions.width < SCREENSM_SIZE ? "2.5rem" : windowDimensions.width < SCREENNXL_SIZE ? "3rem" : "4rem"}>
          {
            <GameMenuBar/>
          }
          </Box>
        </Link>   
      </Box>   
      
    </Box>
  );
}