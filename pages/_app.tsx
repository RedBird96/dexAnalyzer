import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { extendTheme, ChakraProvider } from '@chakra-ui/react'
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import Layout from '../components/PageLayout'
import theme from "./theme";

// const dark = "#232323";
// const light = "#f0f0f0";

// const StyleTheme = {
//   initialColorMode: 'light',
//   useSystemColorMode: true,
//   styles: {
//     global: (props: StyleFunctionProps | Record<string, any>) => ({
//       body: {
//         bg: mode(light, dark)(props)
//       },
//       select: {
//         bg: mode(light, dark)(props)
//       }
//     })
//   },
//   colors:{
//     900: '#fafafa',
//   }
// }

// const theme = extendTheme({ StyleTheme })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
    
  )
}
