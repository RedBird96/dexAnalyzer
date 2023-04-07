import React, { useContext } from "react";
import { useState } from "react";

interface WindowInterface {
  width: number;
  setWidth: (width:number) => void;
  height: number;
  setHeight: (height: number) => void;
}

const WindowContext: React.Context<null | WindowInterface> =
  React.createContext<null | WindowInterface>(null);

export function WindowProvider({children}:any) {

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  return(
    <WindowContext.Provider
      value={{
        width:width,
        setWidth:setWidth,
        height:height,
        setHeight:setHeight
      }}
      >
        {children}
      </WindowContext.Provider>
  );
}

export function useWindow() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("Missing TokenInfo context");
  }

  return context;
}
