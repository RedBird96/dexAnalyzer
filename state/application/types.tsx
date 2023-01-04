
export enum ApplicationStatus {
  INITIAL = 'initial',
  LIVE = 'live',
  PAUSED = 'paused',
  ERROR = 'error',
}

export interface ContractProperties {
  address: string; // contract address
  name: string; // contract name
  chainId: number;
  abi: string[];
}

export interface ApplicationState {
  applicationStatus: ApplicationStatus;
}
