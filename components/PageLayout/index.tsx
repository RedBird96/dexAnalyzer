import style from './PageLayout.module.css'
import React from "react"
import Header from "../Header"
import MenuBar from "../MenuBar"
import TokenBody from "../TokenBody"
import { Box } from "@chakra-ui/react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box >
      <Header/>
      <Box className={style.mainBody} >
        <MenuBar/>
        <TokenBody/>
      </Box> 
    </Box>
  );
}