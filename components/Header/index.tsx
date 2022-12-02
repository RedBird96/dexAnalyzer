import React from 'react'
import { 
  Box, 
  Button, 
  useColorMode, 
  useColorModeValue }
from "@chakra-ui/react"
import {
  useMetamask,
  useWalletConnect,
  useCoinbaseWallet,
  useNetwork,
  useAddress,
  useDisconnect,
  ConnectWallet
} from '@thirdweb-dev/react'
import {Moon, Sun} from "../../assests/icon"
import style from './Header.module.css'

export default function Header() {
  const menuClass = useColorModeValue(
    style.header + " " + style.headerLight,
    style.header + " " + style.headerDark
  );

  const { colorMode, toggleColorMode  } = useColorMode()

  const connectWithMetamask = useMetamask()

  return (
    <Box className={menuClass}>
        <Box display={"flex"} flexDirection="row" alignItems={"center"}>
        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/74.png" width={"50px"}/>
          <p style={{marginLeft:"1rem", fontSize:"1.5rem"}}>Site Title</p>
        </Box>
        <Box display={"flex"} flexDirection="row" alignItems={"center"}>
          {
            colorMode == "dark" ? 
            <Sun className={style.themeMode} onClick={toggleColorMode}/>:
            <Moon className={style.themeMode} onClick={toggleColorMode}/>
          }
          <Box className={style.connectBtn}>
            <ConnectWallet
              colorMode={colorMode}
              accentColor='#0085FF'
            />
          </Box>
        </Box>
         
    </Box>
  );
}