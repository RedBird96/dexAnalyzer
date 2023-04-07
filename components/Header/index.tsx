import React, { useEffect, useMemo, useState } from 'react'
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
  useDisclosure
} from "@chakra-ui/react"
import Image from 'next/image'
import {
  ConnectWallet
} from '@thirdweb-dev/react'
import {
  Moon,
  Sun, 
  SiteLogoMini, 
  SunMini, 
  MoonMini, 
  DownArrowDark, 
  DownArrowLight
} from "../../assests/icon"
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
import SiteIcon from '../../assests/icon/siteIcon.png'
import StockSnippet from './TickerTap'

export default function Header({
  network = "",
  address = ""  
}:{
  network?:string,
  address?:string
}

) {
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
  const [tickComponent, setTickComponent] = useState(null);
  const [keyValue, setKeyValue] = useState(0);
  const { isOpen: isSidebarOpen, onOpen: SidebarOpen, onClose: SidebarClose } = useDisclosure();
  const windowDimensions = useSize();
  
  useMemo(() => {
    const dt = new Date().getTime();
    setKeyValue(dt);
  }, [windowDimensions, colorMode])
  useEffect(() =>{
      if (tokenData != undefined && address != tokenData.contractAddress && isSidebarOpen)
        SidebarClose();
  },[address])
  return (
    <Box className={menuClass}>
        {
          windowDimensions.width > SCREENSM_SIZE ?
          <>
            <Box display={"flex"} flexDirection="row" alignItems={"center"}>
              <Box
                display={"flex"} 
                width={"90px"} 
                height={"4rem"} 
                alignItems={"center"} 
                justifyContent={"center"}
              >
                <img src={SiteIcon.src} width={"60"} height={"60px"}/>
              </Box>
              <p className={style.logo}>BlockPortal</p>
            </Box>
            {/* {
              windowDimensions.width > SCREENMD_SIZE &&
              <Box
                display={"flex"}
                width={"100%"}
                height={"90%"}
                alignItems={"center"}
                justifyContent={"center"}
                paddingRight={"1.5rem"}
              >
                <StockSnippet keyValue = {keyValue.toString()}/>
              </Box>
            } */}
            <Box display={"flex"} flexDirection="row" alignItems={"center"}>
            {
              <Box 
                width={"260px"} 
                height={"40px"} 
                marginRight={"1rem"}
                background={'linear-gradient(90deg, #6100FF 0%, #6E00DB 53.43%, #A100BB 101.57%)'}
                color={'white'}
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}
                borderRadius={"20px"}
                cursor={'pointer'}
                _hover={{
                  bgGradient: 'linear-gradient(90deg, #904BFF 0%, #9846EA 53.43%, #E22DFF 101.57%);',
                }}
              >
                <a style={{display:"flex"}} href={"/trade/eth/0x3a1bc4014c4c493db3dbfbdd8ee1417113b462bf"}>
                  <p>BlockPortal Native Token</p>
                  <p style={{fontWeight:"bold"}}>&nbsp;BPTL</p>
                   
                </a>
              </Box>
            }
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
            <Flex minWidth='max-content' alignItems='center' gap="2px" width={"100%"}>
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
              <Box 
                display={"flex"} 
                flexDirection="row" 
                paddingRight={"1rem"} 
                alignItems={"center"} 
                width={"100%"}
                justifyContent={"flex-end"}
              >
                <Box 
                  width={"100px"} 
                  height={"20px"} 
                  marginRight={"1rem"}
                  background={'linear-gradient(90deg, #6100FF 0%, #6E00DB 53.43%, #A100BB 101.57%)'}
                  color={'white'}
                  style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center'
                  }}
                  borderRadius={"20px"}
                  cursor={'pointer'}
                  
                >
                  <a style={{fontSize:'8px', display:"flex"}} href={"/trade/eth/0x3a1bc4014c4c493db3dbfbdd8ee1417113b462bf"}>
                    <p>BlockPortal token</p>
                    <p style={{fontWeight:"bold"}}>&nbsp;BPTL</p>
                  </a>
                </Box>
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