import { 
  Box, 
  Divider, 
  Input, 
  InputGroup, 
  InputRightElement, 
  useColorMode, 
  useColorModeValue
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import {
  SwapDownArrowDark,
  SwapDownArrowLight,
} from "../../../assests/icon"
import style from './InputBox.module.css'
import { useEffect, useRef, useState } from "react";
import { ERC20Token } from "../../../utils/type";
import { makeShortTokenName } from "../../../utils";
import * as constant from '../../../utils/constant'
import { useDebounce, useLPTokenPrice } from "../../../hooks";
import { getTokenBalance } from "../../../api";

export default function InputBox({
  showMax,
  token,
  setValue,
  value
}:{
  showMax:Boolean
  token: ERC20Token
  setValue: (x?: any) => void
  value: string
}) {
  
  const address = useAddress();
  const colorMode = useColorMode();
  const inputRef = useRef(null);
  const borderColor = useColorModeValue("#C3C3C3", "#2E2E2E");
  const bgColor = useColorModeValue("#efefef", "#121212");
  const [inputValue, setInputValue] = useState<string>("0");
  const debouncedQuery = useDebounce(inputValue, 200);
  const {lpTokenAddress} = useLPTokenPrice();

  const setMaxInputValue = async () => {
    if (address != undefined) {
      const bal = await getTokenBalance(
        (token.name == "BNB" || token.name == "ETH") ? "NATIVE" : token.contractAddress, 
        address, token.network
      );
      if (bal != constant.NOT_FOUND_TOKEN) {
        setInputValue(bal);
        setValue(parseFloat(bal));
      }
    }
  
  }

  useEffect(() => {
    setInputValue("0");
  },[lpTokenAddress.quoteCurrency_contractAddress])
  useEffect(() => {
    if (debouncedQuery != "")
      setValue(debouncedQuery);
  }, [debouncedQuery]);

  const handleInputValueChange = async (e: { target: { value: string; }; }) => {
    const regExpr = new RegExp("/^\-?\d+((\.|\,)\d+)?$/");
    const value = e.target.value.toLowerCase();
    setInputValue(value);
  };

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
      justifyContent = {"center"}
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
            pattern="^[0-9]*[.,]?[0-9]*$"
            readOnly = {!showMax}
            value = {showMax ? inputValue : value}
            onChange = {handleInputValueChange}
          >
          </Input>
          {
            showMax && 
            <InputRightElement >
              <p style={{cursor:"pointer", color:"#696969"}} onClick={setMaxInputValue}>Max</p>
            </InputRightElement>
          }
        </InputGroup>
      </Box>
      <Divider orientation="vertical" style= {{
              borderColor:borderColor,
              height:"90%"
            }}></Divider>
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
          <p className={style.tokenName}>{token.symbol != undefined && makeShortTokenName(token.symbol, 4)}</p>
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
