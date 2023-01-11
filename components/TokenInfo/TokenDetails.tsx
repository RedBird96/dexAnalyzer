import { Box, useColorModeValue } from "@chakra-ui/react";
import { ERC20Token } from "../../utils/type";
import style from './TokenInfo.module.css'

export default function TokenDetails({
  holdersCount,
  transactionCount,
  tokenData,
  width
}:{
  holdersCount: number,
  transactionCount: number,
  tokenData: ERC20Token,
  width: string
}
) {

  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");
  
  return (
    <Box display={"flex"} flexDirection={"row"} width={width} alignItems={"center"}>
      <Box display={"flex"} flexDirection={"row"} width={"100%"} paddingLeft={"0.1rem"}>
        <Box display={"flex"} flexDirection={"column"} width={"50%"}>
          <p className={style.holder} style={{color:textColor}}>Holders</p>
          <Box _hover={{"textDecoration":"underline"}} cursor="pointer" >
            <a 
              className={style.itemvalue} 
              color={whiteBlackMode} 
              href={tokenData.contractBalanceURL} 
              target="_blank"
              rel="noreferrer noopener"
            >
              {holdersCount}
            </a>
          </Box>
        </Box>
        <Box>
          <p className={style.holder} style={{color:textColor}}>Transactions</p>
          <Box _hover={{"textDecoration":"underline"}} cursor="pointer" >
            <a 
              className={style.itemvalue} 
              color={whiteBlackMode} 
              href={tokenData.contractPage} 
              target="_blank"
              rel="noreferrer noopener"
            >
              {transactionCount}
            </a>
          </Box>
        </Box>              
      </Box>        
    </Box>
  )
}