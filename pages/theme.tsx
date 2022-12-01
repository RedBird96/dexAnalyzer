import { extendTheme } from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
const dark = "#232323";
const light = "#ffffff";

const theme = extendTheme({
  initialColorMode: 'light',
  useSystemColorMode: true,
  styles: {
    global: (props: Record<string, any> | StyleFunctionProps) => ({
      body: {
        bg: mode(light, dark)(props)
      }
    })
  },
  // colors: {
  //   brand: {
  //     100: "#f7fafc",
  //     // ...
  //     900: "#1a202c",
  //   },
  // },
});

export default theme;
