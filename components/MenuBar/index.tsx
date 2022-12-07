import React from 'react'
import { Box, useColorModeValue } from "@chakra-ui/react"
import {images} from "../../config/images"
import style from './MenuBar.module.css'
import {TopMenuBar} from '../../assests/icon'
import {ChartMenuBar} from '../../assests/icon'

export default function MenuBar() {
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
      <div style={{
        display: "flex", 
        justifyContent:"center", 
        height:"4.8rem", 
        alignContent:"center",
        cursor: "pointer",
        backgroundColor:chartSelectColor,
        flexDirection: "column",
        width:"100%",
        alignItems:"center"
      }}>
        <ChartMenuBar/>
      </div>
    </Box>
  );
}