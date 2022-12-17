import React, { useContext, useState } from "react";

interface LPTransactionInterface {
  transactionData: any[];
  setTransactionData: (txData: any[]) => void;
}

const LPTransactionContext: React.Context<null | LPTransactionInterface> =
  React.createContext<null | LPTransactionInterface>(null);

export function LPTransactionProvider({children}:any) {

  const [transactionList, setTransactionList] = useState<any[]>([]);

  return(
    <LPTransactionContext.Provider
      value={{
        transactionData:transactionList,
        setTransactionData: setTransactionList,
      }}
      >
        {children}
      </LPTransactionContext.Provider>
  );
}

export function useLPTransaction() {
  const context = useContext(LPTransactionContext);
  if (!context) {
    throw new Error("Missing LP Transaction context");
  }

  return context;
}
