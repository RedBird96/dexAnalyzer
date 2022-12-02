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
  return (
    <Box className={menuClass}>
      <Box style={{
        display: "flex", 
        justifyContent:"center", 
        height:"80px", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column"
      }}>
        <TopMenuBar/>
      </Box>
      <div style={{
        display: "flex", 
        justifyContent:"center", 
        height:"80px", 
        alignContent:"center",
        cursor: "pointer",
        flexDirection: "column"
      }}>
        <ChartMenuBar/>
      </div>
    </Box>
  );
}