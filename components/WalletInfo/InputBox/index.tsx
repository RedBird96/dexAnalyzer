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
import { useAddress, useNetwork } from "@thirdweb-dev/react";
import {
  SwapDownArrowDark,
  SwapDownArrowLight,
} from "../../../assests/icon"
import { Contract, ethers } from "ethers";
import style from './InputBox.module.css'
import { useEffect, useRef, useState } from "react";
import { ERC20Token } from "../../../utils/type";
import { makeShortTokenName } from "../../../utils";
import ERC20TokenABI from '../../../config/ERC20ABI.json'
import BEP20TokenABI from '../../../config/ERC20ABI.json'
import * as constant from '../../../utils/constant'
import * as endpoint from '../../../utils/endpoints'
import { useDebounce } from "../../../hooks";

export default function SwapTrade({
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
  const network = useNetwork();
  const colorMode = useColorMode();
  const inputRef = useRef(null);
  const bgColor = useColorModeValue("#FFFFFF", "#121212");
  const [inputValue, setInputValue] = useState<string>("0");
  const debouncedQuery = useDebounce(inputValue, 200);

  const setMaxInputValue = async () => {

    let TokenContract:Contract;
    let balance = 0, decimal ;
    if (token.network == constant.ETHEREUM_NETWORK) {
      const provider = new ethers.providers.JsonRpcProvider(constant.ETHRPC_URL, constant.ETHEREUM_NETWORK);
      TokenContract = new ethers.Contract(token.contractAddress, ERC20TokenABI, provider)
    } else if (token.network == constant.BINANCE_NETOWRK) {
      const provider = new ethers.providers.JsonRpcProvider(constant.BSCRPC_URL, constant.BINANCE_NETOWRK);
      TokenContract = new ethers.Contract(token.contractAddress, BEP20TokenABI, provider)
    }
    try {
      decimal = await TokenContract.decimals();
      balance = await TokenContract.balanceOf(address);
      setInputValue(ethers.utils.formatUnits(balance, decimal));
      setValue(parseFloat(ethers.utils.formatUnits(balance, decimal)));
    } catch (err:any) {
      return constant.NOT_FOUND_TOKEN;
    }

  }

  useEffect(() => {
    if (debouncedQuery != "")
      setValue(debouncedQuery);
  }, [debouncedQuery]);

  const handleInputValueChange = async (e: { target: { value: string; }; }) => {
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
            value = {showMax ? inputValue : value}
            onChange = {handleInputValueChange}
          >
          </Input>
          {
            showMax &&  address != "" && address != undefined && 
            <InputRightElement >
              <p style={{cursor:"pointer", color:"#696969"}} onClick={setMaxInputValue}>Max</p>
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
          <p className={style.tokenName}>{makeShortTokenName(token.symbol, 4)}</p>
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
