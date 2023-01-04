import Bep20Abi from '../config/BEP20ABI.json'
import Erc20Abi from '../config/ERC20ABI.json'
import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { JsonRpcProvider, Provider, Web3Provider } from '@ethersproject/providers';
import MulticallAbi from '../config/Multicall.json';
import PancakeRouter02 from '../config/Pancakerouter02.json';
import UniswapRouter from '../config/IUniswapV2Router.json';
import { 
  BINANCE_NETOWRK, 
  BSCRPC_URL, 
  ETHEREUM_NETWORK, 
  ETHRPC_URL, 
  MULTICALL_ADDRESS, 
  PANCAKESWAP_ROUTER, 
  UNISWAP_ROUTER
} from './constant';

/** TODO: use or move to shared/util/contract.utils.ts  */
export const getContract = (
  address: string,
  abi: ContractInterface,
  network: number,
  signer?: Signer | Provider,
) => {
  const simpleRpcProvider = new JsonRpcProvider(network == BINANCE_NETOWRK ? BSCRPC_URL : ETHRPC_URL, network);
  const signerOrProvider = signer ?? simpleRpcProvider;
  return new Contract(address, abi, signerOrProvider);
};

export const getMultiCallContract = (network: number, signer?: Signer | Provider) => {
  return getContract(network == BINANCE_NETOWRK ? MULTICALL_ADDRESS.BSC : MULTICALL_ADDRESS.ETH, MulticallAbi, network, signer);
};

export const getBep20Contract = (
  address: string,
  signer?: Signer | Provider
) => {
  return getContract(address, Bep20Abi, BINANCE_NETOWRK, signer);
};

export const getErc20Contract = (
  address: string,
  signer?: Signer | Provider
) => {
  return getContract(address, Erc20Abi, ETHEREUM_NETWORK, signer);
};

export const getRouterContract = (library: Web3Provider | Signer, network: number) => {
  return getContract(
    network == BINANCE_NETOWRK ? PANCAKESWAP_ROUTER.v2 : UNISWAP_ROUTER.v2,
    network == BINANCE_NETOWRK ? PancakeRouter02 : UniswapRouter,
    network,
    library
  );
};
