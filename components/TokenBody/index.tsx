import React from 'react'
import { Box, GridItem } from "@chakra-ui/react"
import TokenList from "../TokenList"
import TokenHeader from "../TokenHeader"
import TokenInfo from "../TokenInfo"
import TokenChart from "../TokenChart"
import TokenTransaction from "../TokenTransaction"
import WalletInfo from "../WalletInfo"
import style from './TokenBody.module.css'

export default function TokenBody() {
  return (
    <main className={style.tokenBody}>
      <TokenList/>
      <nav>
        <hr aria-orientation='vertical'></hr>
      </nav>
      <Box style={{
        display: "flex", 
        flexDirection: "column", 
        width:"100%"
      }}>
        <TokenInfo/>
        <TokenChart/>
        <TokenTransaction/>
      </Box>
      <nav>
        <hr aria-orientation='vertical'></hr>
      </nav>
      <WalletInfo/>
    </main>
  );
}