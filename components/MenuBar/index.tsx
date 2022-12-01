import React from 'react'
import { Box } from "@chakra-ui/react"
import {images} from "../../config/images"
import style from './MenuBar.module.css'
import {TopMenuBar} from '../../assests/icon'
import {ChartMenuBar} from '../../assests/icon'

export default function MenuBar() {
  return (
    <Box className={style.menuBar}>
      <TopMenuBar className={style.menuImg}/>
      <TopMenuBar className={style.menuImg}/>
    </Box>
  );
}