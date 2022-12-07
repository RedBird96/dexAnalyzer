import React from 'react'
import { Box, GridItem } from "@chakra-ui/react"
import TokenList from "../TokenList"
import TokenHeader from "../TokenHeader"
import TokenInfo from "../TokenInfo"
import MenuBar from "../MenuBar"
import TokenChart from "../TokenChart"
import TokenTransaction from "../TokenTransaction"
import WalletInfo from "../WalletInfo"
import style from './TokenBody.module.css'

export default function TokenBody() {
  return (
    <main className={style.tokenBody}>
      <Box style={{
        display: "flex", 
        flexDirection: "row", 
        width: "21.7%"
      }}>
        <MenuBar/>
        <TokenList/>
      </Box>
      <nav>
        <hr aria-orientation='vertical' style={{width:"1px", color:"#313131"}}></hr>
      </nav>
      <Box style={{
        display: "flex", 
        flexDirection: "column", 
        width: "56.4%"
      }}>
        <TokenInfo/>
        <TokenChart/>
        <TokenTransaction/>
      </Box>
      <nav>
        <hr aria-orientation='vertical' style={{width:"1px", color:"#313131"}}></hr>
      </nav>
      <Box style={{
        display: "flex", 
        width: "21.8%"
      }}>
      <WalletInfo/>
      </Box>      
    </main>
  );
}