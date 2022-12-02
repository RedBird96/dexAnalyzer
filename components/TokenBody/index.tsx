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
      <Box style={{display: "flex", flexDirection: "column"}}>
        <TokenInfo/>
        <TokenChart/>
        <TokenTransaction/>
      </Box>
      <WalletInfo/>
    </main>
  );
}