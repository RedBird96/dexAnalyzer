import { Box, useColorModeValue } from "@chakra-ui/react";
import MenuBar from "../../MenuBar";
import { PlayChess } from "../../../assests/icon";
import { ERC20Token, LPTokenPair, PlayMode } from "../../../utils/type";
import { useLPTokenPrice, useTokenInfo } from "../../../hooks";
import { useMemo } from "react";
import useSize from "../../../hooks/useSize";
import { BINANCE_NETOWRK, SCREENSM_SIZE } from "../../../utils/constant";

export default function ChessBody() {

  const resizeBgColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const {setTokenData} = useTokenInfo();
  const {setLPTokenAddress} = useLPTokenPrice();
  const windowDimensions = useSize();

  const initToken = useMemo(() =>{
    setTokenData({
      name:"",
      symbol:"",
      contractAddress:"",
      price: 1,
      marketCap: "0",
      totalSupply: 0,
      holdersCount: 0,
      balance: 0,
      usdBalance: 0,
      decimals: 6,
      image: ""
    } as ERC20Token);
    setLPTokenAddress({
      name:"",
      symbol:"",
      contractAddress:"",
      price: 0,
      marketCap: "",
      totalSupply: 0,
      holdersCount: 0,
      balance: 0,
      decimals: 18,
      image: "",
      network: BINANCE_NETOWRK,
      token0_name: "0",
      token1_name: "0",
      token0_reserve: 0,
      token1_reserve: 0,
      token0_contractAddress: "",
      token1_contractAddress: "",
      quoteCurrency_contractAddress:"",
      protocolType: ""
    } as LPTokenPair);
  }, [])
      
  return (
    <Box style={{
      display: "flex", 
      flexDirection: "row",
      width: "100%",
      background: resizeBgColor
      }}>
      <Box style={{
        display: "flex", 
        flexDirection: "row",
        width: "21.8%"
        }}>
        <MenuBar
          selectMode={PlayMode.Game}
          onOpen = {null}
        />
        <Box
          margin={windowDimensions.width < SCREENSM_SIZE ? "1rem" : "3rem"}
        >
          <PlayChess/>
        </Box>
      </Box>
    </Box>
  );
}