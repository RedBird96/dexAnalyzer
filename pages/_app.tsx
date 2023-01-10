import React, { useEffect } from 'react'
import { AppProps } from 'next/app';
import { useRouter } from "next/router";
import Providers from './Providers'
import * as gtag from "../utils/gtag";
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps): JSX.Element {

  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: any) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);  

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}
