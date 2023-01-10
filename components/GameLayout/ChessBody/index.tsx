import { Box, useColorModeValue } from "@chakra-ui/react";
import MenuBar from "../../MenuBar";
import { PlayChess } from "../../../assests/icon";
import { PlayMode } from "../../../utils/type";

export default function ChessBody() {

  const resizeBgColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  
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
        />
        <Box
          margin={"3rem"}
        >
          <PlayChess/>
        </Box>
      </Box>
    </Box>
  );
}