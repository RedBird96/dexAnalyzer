import React, { useState } from "react";
import { Box } from "@chakra-ui/react"
import { useRouter } from "next/router";
import GameLayout from "../../components/GameLayout";

const GameContext = () => {
  return(
    <>
      <GameLayout/>
    </>
  )
}

export default GameContext;