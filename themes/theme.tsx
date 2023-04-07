import React from 'react'
import { extendTheme } from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { CardComponent } from './card';
import { globalStyles } from './style';
import { breakpoints } from './breakpoints';
import { SwitchComponent } from './switch';
const dark = "#232323";
const light = "#ffffff";

export const theme = extendTheme(
  globalStyles,
  CardComponent,
  SwitchComponent,
  {
  // useSystemColorMode: true,
  // styles: {
  //   global: (props: Record<string, any> | StyleFunctionProps) => ({
  //     body: {
  //       bg: mode(light, dark)(props)
  //     }
  //   })
  // },
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
  // letterSpacings:
  // {
  //   wider:'0em'
  // },
  // colors: {
  //   borderColor: 'white',
  //   transactionTable: {
  //     100: '#F1F1F1',
  //     700: '#212121',
  //   },
  //   navy: {
  //     50: "#d0dcfb",
  //     100: "#aac0fe",
  //     200: "#a3b9f8",
  //     300: "#728fea",
  //     400: "#3652ba",
  //     500: "#1b3bbb",
  //     600: "#24388a",
  //     700: "#1B254B",
  //     800: "#111c44",
  //     900: "#0b1437",
  //   },
  // },
  // borders: {
  //   '2px': '2px solid gray.200'
  // },
  // sizes: {
  //   4: '0.6rem',
  //   10: '2.2rem',
  // },
  // fontSizes: {
  //   sm: '0.9rem',
  //   xs: '0.8rem'
  // },
  // lineHeights: {
  //   4: '1.5rem',
  // },
  breakpoints: breakpoints
});
