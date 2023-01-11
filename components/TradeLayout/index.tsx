import style from './TokenLayout.module.css'
import React from "react"
import Header from "../Header"
import TokenBody from "../TokenBody"
import { Box, useColorMode } from "@chakra-ui/react"

function TradeLayout({
  network,
  address
}:{
  network: string,
  address: string
}) {
  const { colorMode } = useColorMode()
  
  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Header/>
      <Box className={colorMode == "light" ? style.mainBodylight : style.mainBodyblack} >
        <TokenBody
          network={network}
          address={address}
        />
      </Box> 
    </Box>
  );
}

export default TradeLayout;