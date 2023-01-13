import React from 'react'
import { 
  Box, 
  Button, 
  Drawer, 
  DrawerBody, 
  DrawerContent, 
  DrawerOverlay, 
  Flex, 
  Spacer, 
  useColorMode, 
  useColorModeValue, 
  useDisclosure}
from "@chakra-ui/react"
import Image from 'next/image'
import {
  useMetamask,
  ConnectWallet
} from '@thirdweb-dev/react'
import {Moon, Sun, SiteLogo, SiteLogoMini, SunMini, MoonMini} from "../../assests/icon"
import style from './Header.module.css'
import useSize from '../../hooks/useSize'
import { SCREENMD_SIZE, SCREENSM_SIZE } from '../../utils/constant'
import WalletInfo from '../WalletInfo'
import walletDark from '../../assests/icon/wallet_dark.png'
import walletLight from '../../assests/icon/wallet_light.png'

export default function Header() {
  const menuClass = useColorModeValue(
    style.header + " " + style.headerLight,
    style.header + " " + style.headerDark
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode  } = useColorMode();
  const firstField = React.useRef();
  const drawerbgColor = useColorModeValue("#FEFEFE", "#1C1C1C");
  const borderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const windowDimensions = useSize();
  return (
    <Box className={menuClass} borderBottom={"1px"} borderBottomColor = {borderColorMode}>
        {
          windowDimensions.width > SCREENSM_SIZE ?
          <>
            <Box display={"flex"} flexDirection="row" alignItems={"center"}>
              <SiteLogo/>
              <p className={style.logo}>BlockPortal</p>
            </Box>
            <Box display={"flex"} flexDirection="row" alignItems={"center"}>
            {
              colorMode == "dark" ? 
              <Sun className={style.themeMode} onClick={toggleColorMode}/>:
              <Moon className={style.themeMode} onClick={toggleColorMode}/>
            }
            {
              windowDimensions.width < SCREENMD_SIZE &&
              <Box 
                cursor={"pointer"}
                onClick={onOpen}
                paddingLeft={"0.5rem"}
              >
                {
                  colorMode == "dark" ? 
                  <Image src={walletDark.src} width={"30"} height={"35"} alt=""/> :
                  <Image src={walletLight.src} width={"30"} height={"35"} alt=""/>
                }
                
              </Box>
            }
            <Box className={style.connectBtn}>
              <ConnectWallet
                colorMode={colorMode}
                accentColor='#0085FF'
              />
            </Box>
           </Box> 
          </>:
          <>
            <Flex minWidth='max-content' alignItems='center' gap="20">
              <Box display={"flex"} flexDirection="row" alignItems={"center"} height={"50px"}>
                <SiteLogoMini/>
                <p className={style.logo}>BlockPortal</p>
              </Box>
              <Spacer />
              <Box display={"flex"} flexDirection="row" >
                {
                  colorMode == "dark" ? 
                  <SunMini className={style.themeMode} onClick={toggleColorMode}/>:
                  <MoonMini className={style.themeMode} onClick={toggleColorMode}/>
                }
                {
                  windowDimensions.width < SCREENMD_SIZE &&
                  <Box 
                    cursor={"pointer"}
                    onClick={onOpen}
                    paddingLeft={"0.5rem"}
                  >
                    {
                      colorMode == "dark" ? 
                      <Image src={walletDark.src} width={"25"} height={"25"} alt=""/> :
                      <Image src={walletLight.src} width={"25"} height={"25"} alt=""/>
                    }
                    
                  </Box>
                }
              </Box>
            </Flex>
          </>
        }
         
        <Drawer
              isOpen={isOpen}
              placement = 'right'
              onClose={onClose}
              initialFocusRef={firstField}
              isFullHeight = {false}
            >
              <DrawerOverlay/>
              <DrawerContent minW={{sm:400}}>
                <DrawerBody p = {0} bg = {drawerbgColor}>
                  <WalletInfo
                    tradeVisible = {false}
                    hoverMenu = {true}
                  />
                </DrawerBody>
              </DrawerContent>
            </Drawer>            
    </Box>
  );
}