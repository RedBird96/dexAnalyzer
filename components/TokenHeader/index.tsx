import React from 'react'
import { Box, useColorMode } from "@chakra-ui/react"
import style from './TokenHeader.module.css'

export default function TokenHeader() {
  const { colorMode } = useColorMode()

  return (
    <Box className={colorMode == "light" ? style.tokenHeaderLight : style.tokenHeaderDark}>
    </Box>
  );
}