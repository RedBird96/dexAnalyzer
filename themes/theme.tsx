import React from 'react'
import { extendTheme } from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
const dark = "#232323";
const light = "#ffffff";

export const theme = extendTheme({
  initialColorMode: 'light',
  useSystemColorMode: true,
  styles: {
    global: (props: Record<string, any> | StyleFunctionProps) => ({
      body: {
        bg: mode(light, dark)(props)
      }
    })
  },
  // components: {
  //   Table: {
  //     parts: ['th', 'td'],
  //     baseStyle: {
  //       th: {
  //         borderColor: '#404040',
  //       },
  //       td: {
  //         borderColor: '#404040',
  //       },
  //     },
  //   },
  // },
});
