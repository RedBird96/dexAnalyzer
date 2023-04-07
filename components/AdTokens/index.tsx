import { Icon, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
import LiveToken from "../LiveToken/LiveToken";
import IconBox from "../LiveToken/IconBox";
import { MdBarChart } from "react-icons/md";


export default function TokenAds() {

  const boxBg = useColorModeValue("white", "navy.800");

  return (
    <SimpleGrid
      columns={{ base: 1, md: 3, lg: 6, "2xl": 12 }}
      gap='20px'
      mb='20px'
      w={'100%'}
    >
      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Live'
      />
      
      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Live'
      />
      
      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Live'
      />
      
      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Presale'
      />
      
      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Presale'
      />
      
      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Launching'
      />

      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Launching'
      />

      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Live'
      />

      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Live'
      />          

      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Live'
      />    

      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Live'
      />    

      <LiveToken
        startContent={
          <IconBox
            w='56px'
            h='30px'
            bg={boxBg}
            icon={
              <img width='36px' height='36px' src={"https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"}/>
            }
          />
        }
        name='Add'
      />
    </SimpleGrid>
  );
}