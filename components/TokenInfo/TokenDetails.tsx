import { Box, Stat, StatArrow, StatHelpText, StatLabel, StatNumber, useColorModeValue } from "@chakra-ui/react";
import { ERC20Token } from "../../utils/type";
import style from './TokenInfo.module.css'

export default function TokenDetails({
  label1,
  label2,
  holdersCount,
  transactionCount,
  tokenData,
  width
}:{
  label1: string,
  label2: string,
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
      <Box display={"flex"} flexDirection={"row"} width={"100%"} paddingLeft={"0.1rem"} justifyContent={"space-between"}>
        <Box display={"flex"} flexDirection={"column"} width={"55%"}>
          <p className={style.holder} style={{color:textColor}}>{label1}</p>
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
        <Box display={"flex"} marginRight={"2rem"} flexDirection={"column"} width={"40%"}>
          <p className={style.holder} style={{color:textColor}}>{label2}</p>
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