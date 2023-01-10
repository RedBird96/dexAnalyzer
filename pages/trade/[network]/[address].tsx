import React from "react";
import { useRouter } from "next/router";
import TradeLayout from "../../../components/TradeLayout";

const TradeContext = () => {

  const param = useRouter();
  let {network = "", address = ""} = param.query;

  return(
    <>
      <TradeLayout 
        network={network as string} 
        address={address as string}
      />
    </>
  )
}

export default TradeContext;