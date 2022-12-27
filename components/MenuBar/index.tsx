import React from 'react'
import { Box, useColorModeValue } from "@chakra-ui/react"
import style from './MenuBar.module.css'
import {GameMenuBar, TopMenuBar} from '../../assests/icon'
import {TradeMenuBar} from '../../assests/icon'
import { usePlayMode } from '../../hooks/usePlayMode'

export default function MenuBar() {
  const {showMode, setShowMode} = usePlayMode();
  const menuClass = useColorModeValue(
    style.menuBar + " " + style.menuBarLight,
    style.menuBar + " " + style.menuBarDark
  );
  const chartSelectColor = useColorModeValue("#0067C6", "#2F2F2F");
  return (
    <Box className={menuClass}>
      <Box style={{
        display: "flex", 
        justifyContent:"center", 
        height:"4.8rem", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column",
        width:"100%",
        alignItems:"center"
      }}>
        <TopMenuBar className={"text-1x"}/>
      </Box>
      <Box style={{
        display: "flex", 
        justifyContent:"center", 
        height:"5rem", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column",
        width:"100%",
        alignItems:"center"
        }}
        onClick = {() => setShowMode("Trade")}
        _hover={{bg:chartSelectColor}}
        background = {showMode === "Trade" ? chartSelectColor : "transparent"}
      >
        <TradeMenuBar/>
      </Box>
      <Box style={{
        display: "flex", 
        justifyContent:"center", 
        height:"5rem", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column",
        width:"100%",
        alignItems:"center"
        }}
        _hover={{bg:chartSelectColor}}
        onClick = {() => setShowMode("Games")}
        background = {showMode === "Games" ? chartSelectColor : "transparent"}
      >
        <GameMenuBar/>
      </Box>      
      
    </Box>
  );
}