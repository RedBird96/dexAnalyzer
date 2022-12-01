import React from 'react'
import { Grid, GridItem } from "@chakra-ui/react"
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
      <Grid className={style.tokenGrid}>
        <GridItem rowSpan={8} colSpan={1}>
          <TokenList/>
        </GridItem>
        <GridItem rowSpan={1} colSpan={4}>
          <TokenHeader/>
        </GridItem>
        <GridItem rowSpan={1} colSpan={3}>
          <TokenInfo/>
        </GridItem>
        <GridItem rowSpan={4} colSpan={3}>
          <TokenChart/>
        </GridItem>
        <GridItem rowSpan={2} colSpan={3}>
          <TokenTransaction/>
        </GridItem>
        <GridItem 
          gridColumnStart={5} 
          gridColumnEnd={6} 
          gridRowStart={2} 
          gridRowEnd={9} 
          height={"100%"}
        >
          <WalletInfo/>
        </GridItem>
      </Grid>
    </main>
  );
}