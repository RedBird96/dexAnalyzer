import TradeLayout from '../components/TradeLayout'
import { Box } from '@chakra-ui/react'

export default function Home() {

  return (
    <Box>
      <TradeLayout 
        network={''} 
        address={''}
      />
    </Box>
  )
}
