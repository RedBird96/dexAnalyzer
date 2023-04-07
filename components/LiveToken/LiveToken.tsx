// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  HStack,
  Box,
  VStack,
  TagLabel,
  Tag,
  TagLeftIcon,
} from "@chakra-ui/react";
// Custom components
import Card from "../Card/card";
// Custom icons
import React from "react";
import style from './LiveToken.module.css'
import { MdCircle, MdFileCopy, MdPostAdd } from "react-icons/md";

export default function LiveToken(props:any) {
  const { startContent, endContent, name, growth, value } = props;
  const symbolColor = useColorModeValue("secondaryGray.900", "white");
  const nameColor = useColorModeValue("secondaryGray.900", "#A6A6A6");

  return (
    <Card 
      padding='10px 10px 10px 0px' 
      borderRadius='50px'
      height='50px'
    >
      {name != 'Add' ? 
      <>
        <Tag 
          borderRadius={'full'} 
          width={'60px'} 
          justifyContent={'center'} 
          bg={name == 'Live' ? '#00A52E' : name == 'Presale' ? '#FF00B8' : '#FF9900'} 
          height={'12px'}
          position={'absolute'}
          top={'-7px'}
          right={'10px'}
          minH={'15px'}
        >
          {name == 'Live' && <TagLeftIcon as={MdCircle} width={'10px'} height={'10px'}></TagLeftIcon>}
          <TagLabel>
            <p className={style.tokenLive}>{name}</p>
          </TagLabel>
        </Tag>
        <Flex
          my='auto'
          w='100%'
          justifyContent={'space-between'}
        >
          <HStack>
            {startContent}
            <VStack alignItems={'flex-start'}>
              <p className={style.tokenSymbol} style={{color:symbolColor}}>DOGE</p>
              <p className={style.tokenName} style={{color:nameColor}}>Doge coin</p>
            </VStack>
          </HStack>
          <Box display={'flex'} alignItems={'center'} width={'20px'}>
            <img src={"https://s2.coinmarketcap.com/static/img/coins/32x32/1027.png"}/>
          </Box>
        </Flex>
      </>:
      <VStack>
        <p>Post Ad</p>
      </VStack>
      }
    </Card>
  );
}
