import React from 'react'
import { Box, Button, useColorMode } from "@chakra-ui/react"
import {Moon, Sun} from "../../assests/icon"
import style from './Header.module.css'

export default function Header() {

  const { colorMode, toggleColorMode  } = useColorMode()
  return (
    <Box className={style.header}>
      {
      colorMode == "dark" ? 
      <Sun className={style.themeMode} onClick={toggleColorMode}/>:
      <Moon className={style.themeMode} onClick={toggleColorMode}/>
      }
      <Button
        marginLeft={"10px"}
      >
        Connect Wallet        
      </Button>
    </Box>
  );
}