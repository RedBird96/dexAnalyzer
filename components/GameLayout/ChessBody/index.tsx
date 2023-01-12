import { Box, useColorModeValue } from "@chakra-ui/react";
import MenuBar from "../../MenuBar";
import { PlayChess } from "../../../assests/icon";
import { ERC20Token, PlayMode } from "../../../utils/type";
import { useTokenInfo } from "../../../hooks";
import { useMemo } from "react";
import useSize from "../../../hooks/useSize";
import { SCREENSM_SIZE } from "../../../utils/constant";

export default function ChessBody() {

  const resizeBgColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const {setTokenData} = useTokenInfo();
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
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
    } as ERC20Token);
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