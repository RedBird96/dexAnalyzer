import { ChakraProvider } from '@chakra-ui/react'
import { ThirdwebProvider, ChainId } from '@thirdweb-dev/react';
import { Provider } from 'react-redux';
import {TokenInfoProvider} from '../hooks/useTokenInfo'
import { theme } from "../themes/theme";
import { LpTokenPriceProvider } from '../hooks/useLPTokenPrice';
import { WalletTokenBalanceProvider } from '../hooks/useWalletBalanceTokens';
import { StableCoinPriceProvider } from '../hooks/useStableCoinPrice';
import { LPTransactionProvider } from '../hooks/useLPTransaction';
import { PlayModeProvider } from '../hooks/usePlayMode';
import state from '../state'

interface Props {
  children: React.ReactNode;
}

const desiredChainId = ChainId.Mainnet;
const supportChain = [1, 56];

const Providers: React.FC<Props> = ({ children }) => {
  return (
    <ChakraProvider theme={theme}>
      <Provider store={state}>
        <ThirdwebProvider desiredChainId={desiredChainId} supportedChains={supportChain}>
          <PlayModeProvider>
            <StableCoinPriceProvider>
              <TokenInfoProvider>
                <LpTokenPriceProvider>
                  <LPTransactionProvider>
                      <WalletTokenBalanceProvider>
                        {children}
                      </WalletTokenBalanceProvider>
                    </LPTransactionProvider>
                </LpTokenPriceProvider>
              </TokenInfoProvider>
            </StableCoinPriceProvider>
            </PlayModeProvider>
        </ThirdwebProvider>
      </Provider>
    </ChakraProvider>
  );
}

export default Providers
