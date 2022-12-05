import dynamic from 'next/dynamic'
import style from './PageLayout.module.css'
import React from "react"
import Header from "../Header"
import TokenBody from "../TokenBody"
import { Box, useColorMode } from "@chakra-ui/react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode()

  return (
    <Box >
      <Header/>
      <nav><hr aria-orientation='horizontal'/></nav>
      <Box className={colorMode == "light" ? style.mainBodylight : style.mainBodyblack} >
        <TokenBody/>
      </Box> 
    </Box>
  );
}