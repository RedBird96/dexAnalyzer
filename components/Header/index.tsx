import React from 'react'
import { 
  Box, 
  Button, 
  Drawer, 
  DrawerBody, 
  DrawerContent, 
  DrawerHeader, 
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
import {Moon, Sun, SiteLogo, SiteLogoMini, SunMini, MoonMini, DownArrowDark, DownArrowLight} from "../../assests/icon"
import style from './Header.module.css'
import useSize from '../../hooks/useSize'
import { SCREENMD_SIZE, SCREENSM_SIZE } from '../../utils/constant'
import WalletInfo from '../WalletInfo'
import walletDark from '../../assests/icon/wallet_dark.png'
import walletLight from '../../assests/icon/wallet_light.png'
import MenuBar from '../MenuBar'
import { PlayMode } from '../../utils/type'
import TokenList from '../TokenList'
import * as constant from '../../utils/constant'
import { useTokenInfo } from '../../hooks'

export default function Header() {
  const menuClass = useColorModeValue(
    style.header + " " + style.headerLight,
    style.header + " " + style.headerDark
  );

  const resizeBgColor = useColorModeValue("#FFFFFF", "#1C1C1C");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode  } = useColorMode();
  const {tokenData} = useTokenInfo();
  const firstField = React.useRef();
  const drawerbgColor = useColorModeValue("#FEFEFE", "#1C1C1C");
  const borderColorMode = useColorModeValue("#E2E8F0","#2B2A2A");
  const { isOpen: isSidebarOpen, onOpen: SidebarOpen, onClose: SidebarClose } = useDisclosure();
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
            <Flex minWidth='max-content' alignItems='center' gap="15" width={"100%"}>
              <Box display={"flex"} flexDirection="row" alignItems={"center"} height={"50px"}>
                {
                  tokenData != undefined && 
                  <Box
                    paddingLeft={"1rem"}
                  >
                    <Box
                      cursor={"pointer"} 
                      style={{transform:`rotate(90deg)`}}
                      onClick={SidebarOpen}
                      marginLeft={"0.3rem"}
                      marginRight={"0.2rem"}
                    >
                      {colorMode == "dark" ?
                        <DownArrowDark/> :
                        <DownArrowLight/> 
                      }

                      <Drawer
                        isOpen={isSidebarOpen}
                        placement = 'left'
                        onClose={SidebarClose}
                        initialFocusRef={firstField}
                        isFullHeight = {false}
                      >
                        <DrawerOverlay/>
                        <DrawerContent backgroundColor={resizeBgColor}>
                          <DrawerHeader>
                          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} height={"2rem"} marginLeft={"-1rem"}>
                            <SiteLogoMini/>
                            <p className={style.logo}>BlockPortal</p>
                          </Box>
                          </DrawerHeader>
                          <DrawerBody p = {0}>
                            <Box
                              display={"flex"}
                              flexDirection={"row"}
                              width={"100%"}
                              height={"100%"}
                            >
                              <MenuBar
                                selectMode={PlayMode.Trade}
                                onOpen = {null}
                              />
                              <TokenList
                                network = {tokenData.network == constant.ETHEREUM_NETWORK ? "eth" : "bsc"}
                                address = {tokenData.contractAddress}
                              />
                            </Box>
                          </DrawerBody>
                        </DrawerContent>
                      </Drawer>                  
                    </Box>
                  </Box>
                }                       
                <SiteLogoMini/>
                <p className={style.logo}>BlockPortal</p>
              </Box>
              <Spacer />
              <Box display={"flex"} flexDirection="row" paddingRight={"1rem"} >
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