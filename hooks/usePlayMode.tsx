import React, { useContext, useEffect, useState } from "react";
import { ERC20Token } from '../utils/type'

interface PlayModeInterface {
  showMode: string;
  setShowMode: (token: string) => void;
}

const PlayModeContext: React.Context<null | PlayModeInterface> =
  React.createContext<null | PlayModeInterface>(null);

export function PlayModeProvider({children}:any) {
   
  const [tokens, setTokens] = useState<string>("Trade");
  return(
    <PlayModeContext.Provider
      value={{
        showMode:tokens,
        setShowMode: setTokens,
      }}
      >
        {children}
      </PlayModeContext.Provider>
  );
}

export function usePlayMode() {
  const context = useContext(PlayModeContext);
  if (!context) {
    throw new Error("Missing PlayMode context");
  }

  return context;
}
