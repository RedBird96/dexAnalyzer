import React from 'react'
import { Box, Button } from "@chakra-ui/react"
import {Moon} from "../../assests/icon"
import style from './Header.module.css'

export default function Header() {
  return (
    <Box className={style.header}>
      <Moon className={style.themeMode}/>
      <Button
        marginLeft={"10px"}
      >
        Connect Wallet        
      </Button>
    </Box>
  );
}