import React, { useContext } from "react";

interface AbortControllerInfoInterface {
  controller: AbortController;
}

const AbortControllerContext: React.Context<null | AbortControllerInfoInterface> =
  React.createContext<null | AbortControllerInfoInterface>(null);

export function AbortControllerProvider({children}:any) {

  const initController = new AbortController()

  return(
    <AbortControllerContext.Provider
      value={{
        controller:initController
      }}
      >
        {children}
      </AbortControllerContext.Provider>
  );
}

export function useAbortController() {
  const context = useContext(AbortControllerContext);
  if (!context) {
    throw new Error("Missing TokenInfo context");
  }

  return context;
}
