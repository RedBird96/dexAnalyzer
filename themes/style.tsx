import { mode } from "@chakra-ui/theme-tools";
export const globalStyles = {
  initialColorMode: 'dark',
  colors: {
    brand: {
      100: "#E9E3FF",
      200: "#422AFB",
      300: "#422AFB",
      400: "#7551FF",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#11047A",
    },
    brandScheme: {
      100: "#E9E3FF",
      200: "#7551FF",
      300: "#7551FF",
      400: "#7551FF",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#02044A",
    },
    brandTabs: {
      100: "#E9E3FF",
      200: "#422AFB",
      300: "#422AFB",
      400: "#422AFB",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#02044A",
    },
    secondaryGray: {
      100: "#E0E5F2",
      200: "#E1E9F8",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#8F9BBA",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#CACACA",
    },
    red: {
      100: "#FEEFEE",
      500: "#EE5D50",
      600: "#E31A1A",
    },
    blue: {
      50: "#EFF4FB",
      500: "#3965FF",
    },
    orange: {
      100: "#FFF6DA",
      500: "#FFB547",
    },
    green: {
      100: "#E6FAF5",
      500: "#01B574",
    },
    navy: {
      50: "#d0dcfb",
      100: "#8E9FAF",
      200: "#192532",
      300: "#728fea",
      400: "#203243",
      500: "#0B1116",
      600: "#232F3D",
      700: "#17212B",
      800: "#182633",
      900: "#0E1621",
    },
    gray: {
      100: "#FAFCFE",
    },
  },
  styles: {
    global: (props:any) => ({
      body: {
        overflowX: "hidden",
        bg: mode("secondaryGray.900", "navy.900")(props),
        fontFamily: "Inter",
      },
      input: {
        color: "gray.700",
      },
    }),
  },
};
