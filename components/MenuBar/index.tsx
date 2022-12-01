import React from 'react'
import { Box, useColorMode } from "@chakra-ui/react"
import {images} from "../../config/images"
import style from './MenuBar.module.css'
import {TopMenuBar} from '../../assests/icon'
import {ChartMenuBar} from '../../assests/icon'

export default function MenuBar() {
  const { colorMode } = useColorMode()
  const dark = style.menuBar + " " + style.menuBarDark;
  const light = style.menuBar + " " + style.menuBarLight;
  return (
    <Box className={colorMode == "light" ? light : dark}>
      <div style={{display: "flex", justifyContent:"center"}}>
        <TopMenuBar className={style.menuImg}/>
      </div>
      <div style={{display: "flex", justifyContent:"center"}}>
        <ChartMenuBar className={style.menuImg}/>
      </div>
    </Box>
  );
}