import React, {useEffect, useState} from 'react'
import Image from 'next/image'
import { 
  PinLightIcon,
  UnPinLightIcon,
  SearchCross,
  LightCross
} from '../../../assests/icon'
import { 
  Box, 
  Input, 
  Button, 
  useColorModeValue, 
  useColorMode, 
  Tag, 
  TagLeftIcon, 
  HStack, 
  VStack, 
  TagLabel, 
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react"
import {
  MdOutlineMoreVert
} from "react-icons/md";
import style from './TokenListItem.module.css'
import {makeShortAddress, makeShortTokenName} from '../../../utils'
import { ERC20Token } from '../../../utils/type'
import * as constant from '../../../utils/constant'
import Link from 'next/link'
import pin from '../../../assests/icon/pin.png'
import unpin from '../../../assests/icon/unpin.png'
import pinlight from '../../../assests/icon/pin_light.png'
import whitepinlight from '../../../assests/icon/whitepin_light.png'
import unpinlight from '../../../assests/icon/unpin_light.png'
import useSize from '../../../hooks/useSize'
import { useTokenInfo } from '../../../hooks'

const TokenListItem = ({
  listedTokenData,
  activeToken,
  activeTokenHandler,
  pinTokenHandler
}:{
  listedTokenData: ERC20Token,
  activeToken: ERC20Token,
  activeTokenHandler: (x?: any) => void,
  pinTokenHandler: (x?: any, y?:boolean) => void
}) => {

  const colorMode = useColorMode();
  const {tokenData, setTokenData} = useTokenInfo();
  const nameColor = useColorModeValue("#3b2c2c","#FFFFFF");
  const textColor = useColorModeValue("#3b2c2c","#767676");
  const textColorActive = useColorModeValue("#D7D7D7","#A7A7A7");
  const whiteColor = useColorModeValue("#000000","#FFFFFF");
  const hoverColor = useColorModeValue("#359EFF","#3A3A29");
  const addressColor = useColorModeValue("#6a6a6a","#6a6a6a");
  const addressColorActive  = useColorModeValue("#D7D7D7","#6a6a6a");
  const itemBackcolor = useColorModeValue("#E9F4FF", "#2F2F2F");
  const [isHover, setIsHover] = useState<Boolean>(false);
  const [isActive, setIsActive] = useState<Boolean>(false);
  const windowDimensions = useSize();
  const [showCrossIcon, setShowCrossIcon] = useState<Boolean>(false);
  useEffect(() => {
      setIsActive(activeToken == listedTokenData);
  }, [activeToken, listedTokenData]);
  const setPinIcon = () => {
    listedTokenData.pinSetting = !listedTokenData.pinSetting;
    setShowCrossIcon(false);
    pinTokenHandler(listedTokenData, true);
  }
  const setActiveToken = () => {
    if (tokenData != undefined && tokenData.controller != undefined) {
      tokenData.controller?.abort();
    }
    listedTokenData.controller = new AbortController();
    activeTokenHandler(listedTokenData);
  }
  const handleCross = () => {
    pinTokenHandler(listedTokenData, false);
    if (listedTokenData.contractAddress.toLowerCase() == tokenData.contractAddress.toLowerCase()) {
      setTokenData({
        name:"",
        symbol:"",
        contractAddress:"",
        price: 1,
        marketCap: "0",
        totalSupply: 0,
        holdersCount: 0,
        balance: 0,
        usdBalance: 0,
        decimals: 6,
        image: ""
      } as ERC20Token);
    }
  }
  return(
      <Box className= {style.tokenListInfo} 
        _hover={{ bg: hoverColor }}
        onMouseOver={() => {setIsHover(true)}}
        onMouseOut={() => {setIsHover(false)}}
        backgroundColor={isActive ? colorMode.colorMode == "dark" ? hoverColor : "#0085FF" : listedTokenData.pinSetting ? itemBackcolor : "transparent"}
        color={isActive?"#FFFFFF":whiteColor}
        onMouseMove={() => {
          setShowCrossIcon(true)
        }}
        onMouseLeave={() => setShowCrossIcon(false)}    
        borderBottomColor={'#131D27 !important'}
        borderBottom={'1px'}  
      >
        <HStack style={{width:'90%'}}>
          <img src={listedTokenData?.image} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "30rem" : "40rem"}/>
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} width={'100%'}>
            <Link href={`/trade/${listedTokenData.network == constant.ETHEREUM_NETWORK ? "eth" : "bsc"}/${listedTokenData.contractAddress}`}    >
              <VStack alignItems={'flex-start'} onClick={setActiveToken}>
                <p className={style.tokenName} style={{color:isActive || isHover ? "#FFFFFF" : nameColor}}>{makeShortTokenName(listedTokenData?.name, windowDimensions.width < constant.SCREENSM_SIZE ? 7 : 13)}</p>
                <p className={style.tokenSymbol} style={{color:isActive || isHover ? "#FFFFFF" : nameColor, marginTop:'0px'}}>{makeShortTokenName(listedTokenData?.symbol, 5)}</p>
              </VStack>
            </Link>
            <HStack spacing={'20px'}>
              <Tag borderRadius={'full'} bg={'navy.400'}>
                <TagLabel className={style.tokenAddress}>{makeShortAddress(listedTokenData?.contractAddress!, 7, 4)}</TagLabel>
              </Tag>
              {
                listedTokenData?.network == constant.ETHEREUM_NETWORK ?
                <img src = {"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"}/>:
                <img src = {"https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"}/>
              }
              <Menu>
                <MenuButton>
                  <Icon display={'flex'} justifyContent={'center'} as={MdOutlineMoreVert} w='24px' h='24px'/>
                </MenuButton>
                <MenuList minWidth={'50px'}>
                  <MenuItem onClick={handleCross}>Remove</MenuItem>
                  <MenuItem onClick={setPinIcon}>Pin</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Box>
          {/* <Link style={{width:"80%"}} href={`/trade/${listedTokenData.network == constant.ETHEREUM_NETWORK ? "eth" : "bsc"}/${listedTokenData.contractAddress}`}    >
            <Box 
              style={{display:"flex", flexDirection:"row", alignItems:"center", width:"80%"}}
              onClick={setActiveToken}
            >
              <Box display={"flex"} flexDirection={"column"} textAlign={"start"} marginLeft={"1rem"}>
                <Box display={"flex"} flexDirection={"row"} >
                  <p className={style.tokenName} style={{color:isActive || isHover ? "#FFFFFF" : nameColor}}>{makeShortTokenName(listedTokenData?.name, windowDimensions.width < constant.SCREENSM_SIZE ? 7 : 13)}</p>
                  <p className={style.tokenName} style={{color:isActive || isHover ? textColorActive : textColor}}>&nbsp;({makeShortTokenName(listedTokenData?.symbol, 5)})</p>
                </Box>
                <p className={style.tokenAddress} style ={{color:isActive || isHover ? addressColorActive : addressColor}}>{makeShortAddress(listedTokenData?.contractAddress!, 7, 4)}</p>
              </Box>
            </Box>
          </Link> */}
          {/* <Box style={{
            display:"flex", 
            flexDirection:"row", 
            alignItems:"center", 
            justifyContent:"space-between",
            }}
            width = {showCrossIcon?"4.5rem":"3rem"}
          >
            {
              listedTokenData?.network == constant.ETHEREUM_NETWORK ?
              <img src = {"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"}/>:
              <img src = {"https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"}/>
            }
            <Box onClick={setPinIcon}>
            {
              colorMode.colorMode == "light" ? 
              listedTokenData?.pinSetting == false ? 
              <Image src = {unpinlight.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/> : 
              isActive ?
              <Image src = {whitepinlight.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/>:
              <Image src = {pinlight.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/>
              : 
              listedTokenData?.pinSetting == false ? 
                <Image src = {unpin.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/> : 
                <Image src = {pin.src} width={windowDimensions.width < constant.SCREENNXL_SIZE ? "15": "20"} height={"15"} alt=""/>
            }    
            </Box>   
            {
              showCrossIcon == true && 
              <Box onClick={handleCross}>
                {
                  isActive ? 
                  <Link href={'/trade'}>
                    {colorMode.colorMode == "dark" ? <SearchCross/> : <LightCross/>}
                  </Link> :
                  colorMode.colorMode == "dark" ? <SearchCross/> : <LightCross/>
                }
              </Box>
            }   
          </Box>   */}
        </HStack>
        
      </Box>
  );
}

export default TokenListItem;