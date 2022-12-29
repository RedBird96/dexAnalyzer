import { 
  Box, 
  Divider, 
  Input, 
  InputGroup, 
  InputRightAddon, 
  InputRightElement, 
  useColorMode, 
  useColorModeValue
} from "@chakra-ui/react";
import {
  SwapDownArrowDark,
  SwapDownArrowLight,
} from "../../../assests/icon"
import style from './InputBox.module.css'
import { useEffect, useRef, useState } from "react";
import { ERC20Token } from "../../../utils/type";
import { makeShortTokenName } from "../../../utils";

export default function SwapTrade({
  showMax,
  token,
}:{
  showMax:Boolean
  token: ERC20Token
}) {
  
  const colorMode = useColorMode();
  const inputRef = useRef(null);
  const bgColor = useColorModeValue("#FFFFFF", "#121212");

  return (
    <Box
      style={{
        width:"100%",
        backgroundColor:bgColor,
      }}
      display = {"flex"}
      flexDirection = {"row"}
      borderRadius={"5px"}
      padding = {"0.2rem"}
    >
      <Box
        style={{
          width: "70%",
          height: "100%"
        }}
        marginRight = {"0.5rem"}
        ref = {inputRef}
      >
        <InputGroup>
          <Input
            borderColor ={bgColor}
            placeholder = "0.0"
            type="number"
            _focus={{
              boxShadow: 'none',
              borderColor: bgColor
            }}
            _hover = {{
              boxShadow: 'none',
              borderColor: bgColor
            }}
            readOnly = {!showMax}
          >
          </Input>
          {
            showMax && 
            <InputRightElement >
              <p style={{cursor:"pointer", color:"#696969"}}>Max</p>
            </InputRightElement>
          }
        </InputGroup>
      </Box>
      <Divider orientation="vertical"></Divider>
      <Box
        style={{
          width: "30%",
          height: "100%"
        }}      
        display = {"flex"}
        flexDirection = {"row"}
        alignItems = {"center"}
        justifyContent = {"space-evenly"}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <img src={token.image} width={"20rem"}/>
          <p className={style.tokenName}>{makeShortTokenName(token.symbol, 3)}</p>
        </Box>
        <Box
          cursor={"pointer"} 
        >
          {colorMode.colorMode == "dark" ?
            <SwapDownArrowDark/> :
            <SwapDownArrowLight/> 
          }
        </Box>
      </Box>
    </Box>
  )
}
