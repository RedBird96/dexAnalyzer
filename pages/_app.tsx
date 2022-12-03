import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { ThirdwebProvider, ChainId } from '@thirdweb-dev/react';
import {TokenInfoProvider} from '../utils/useTokenInfo'
import Layout from '../components/PageLayout'
import { theme } from "../themes/theme";

export default function App({ Component, pageProps }: AppProps) {

  const desiredChainId = ChainId.Mainnet;

  return (
    <ChakraProvider theme={theme}>
      <ThirdwebProvider desiredChainId={desiredChainId}>
        <TokenInfoProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </TokenInfoProvider>
      </ThirdwebProvider>
    </ChakraProvider>
    
  )
}
