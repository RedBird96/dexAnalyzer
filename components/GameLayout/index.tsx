import style from './GameLayout.module.css'
import React from "react"
import Header from "../Header"
import { Box, useColorMode } from "@chakra-ui/react"
import ChessBody from './ChessBody'
import useSize from '../../hooks/useSize'

export default function GameLayout() {
  const { colorMode } = useColorMode()

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Header/>
      <Box className={colorMode == "light" ? style.mainBodylight : style.mainBodyblack} >
        <ChessBody/>
      </Box> 
    </Box>
  );
}