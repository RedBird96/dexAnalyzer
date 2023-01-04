import { Fragment, Interface, JsonFragment } from '@ethersproject/abi';
import { getMultiCallContract } from './contract';

export type MultiCallResponse<T> = T | null;

export interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (example: balanceOf)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[]; // Function params
}

interface MulticallOptions {
  requireSuccess?: boolean;
}

const multicall = async <T>(abi: string[], calls: Call[], network: number): Promise<T> => {
  try {
    const multi = getMultiCallContract(network);
    const itf = new Interface(abi);

    const calldata = calls.map(call => [
      call.address.toLowerCase(),
      itf.encodeFunctionData(call.name, call.params),
    ]);
    const { returnData } = await multi['aggregate'](calldata);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = returnData.map((call: any, i: number) =>
      itf.decodeFunctionResult(calls[i].name, call)
    );

    return res;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      console.error(error);
      throw new Error('unknown error in multicall');
    }
  }
};

/**
 * Multicall V2 uses the new "tryAggregate" function. It is different in 2 ways
 *
 * 1. If "requireSuccess" is false multicall will not bail out if one of the calls fails
 * 2. The return includes a boolean whether the call was successful e.g. [wasSuccessful, callResult]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const multicallv2 = async <T = any>(
  abi: string | ReadonlyArray<Fragment | JsonFragment | string>,
  calls: Call[],
  network: number,
  options: MulticallOptions = { requireSuccess: true }
): Promise<MultiCallResponse<T>> => {
  const { requireSuccess } = options;
  const multi = getMultiCallContract(network);

  const itf = new Interface(abi);

  const calldata = calls.map(call => [
    call.address.toLowerCase(),
    itf.encodeFunctionData(call.name, call.params),
  ]);
  const returnData = await multi['tryAggregate'](requireSuccess, calldata);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = returnData.map((call: any, i: number) => {
    const [result, data] = call;
    return result ? itf.decodeFunctionResult(calls[i].name, data) : null;
  });

  return res;
};

export default multicall;
