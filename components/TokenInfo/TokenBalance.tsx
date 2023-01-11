import { Box, useColorModeValue } from "@chakra-ui/react";
import { ERC20Token } from "../../utils/type";
import { convertBalanceCurrency, numberWithCommasTwoDecimals } from "../../utils";
import style from './TokenInfo.module.css'
import { useAddress } from "@thirdweb-dev/react";

export default function TokenBalance({
  balance,
  balanceUSD,
  tokenData,
  width
}:{
  balance: number,
  balanceUSD: number,
  tokenData: ERC20Token,
  width: string
}
) {
  
  const address = useAddress();
  const priceColor = useColorModeValue("#00B112","#00C514");
  const whiteBlackMode = useColorModeValue('#FFFFFF', '#000000');
  const textColor = useColorModeValue("#5E5E5E","#A7A7A7");

  return (
    <Box display={"flex"} flexDirection={"column"} width={width}>
      <p className={style.marketCap} style={{color:textColor}}>Balance</p>
      <Box _hover={{"textDecoration":"underline"}} cursor="pointer">
      <a style = {{display:"flex", flexDirection:"row", alignItems:"center"}}
          href={tokenData.contractBalanceWalletURL + address}
          target="_blank"
          rel="noreferrer noopener" >
      
        <p
          className={style.itemvalue} 
          style={{marginRight:"1rem"}} 
          color={whiteBlackMode} 
        >
          {numberWithCommasTwoDecimals(balance)}
        </p>
        <p className={style.itemvalue}  style={{color:priceColor}} >({convertBalanceCurrency(balanceUSD, 2)})</p>
      </a>
      </Box>
    </Box>     
  )
}
