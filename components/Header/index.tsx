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
  const address = useAddress();
  const network = useNetwork();
  
  if (address) {
    console.log('Address',address, network);
  }

  return (
    <Box className={menuClass}>
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
  );
}