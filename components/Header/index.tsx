import React from 'react'
import { 
  Box, 
  Button, 
  useColorMode, 
  useColorModeValue }
from "@chakra-ui/react"
import {
  useMetamask,
  ConnectWallet
} from '@thirdweb-dev/react'
import {Moon, Sun, SiteLogo} from "../../assests/icon"
import style from './Header.module.css'

export default function Header() {
  const menuClass = useColorModeValue(
    style.header + " " + style.headerLight,
    style.header + " " + style.headerDark
  );

  const { colorMode, toggleColorMode  } = useColorMode()

  return (
    <Box className={menuClass}>
        <Box display={"flex"} flexDirection="row" alignItems={"center"}>
          <SiteLogo/>
          <p className={style.logo}>BlockPortal</p>
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