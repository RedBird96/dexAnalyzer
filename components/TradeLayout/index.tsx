import style from './TokenLayout.module.css'
import React from "react"
import Header from "../Header"
import TokenBody from "../TokenBody"
import { 
  Box, 
  useColorMode,
  Card,
  CardBody,
  CardFooter,
  CardHeader
} from "@chakra-ui/react"
import useSize from '../../hooks/useSize'

function TradeLayout({
  network,
  address
}:{
  network: string,
  address: string
}) {
  const { colorMode } = useColorMode()
  
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      height="100vh"
    >
      <Header
        network={network}
        address={address}
      />
      
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