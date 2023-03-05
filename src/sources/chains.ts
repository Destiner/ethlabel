const ETHEREUM = 1;
const OPTIMISM = 10;
const POLYGON = 137;
const ZKSYNC_ERA_GOERLI = 280;
const ARBITRUM = 42161;

const CHAINS: ChainId[] = [
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  ZKSYNC_ERA_GOERLI,
  ARBITRUM,
];

type ChainId =
  | typeof ETHEREUM
  | typeof OPTIMISM
  | typeof POLYGON
  | typeof ZKSYNC_ERA_GOERLI
  | typeof ARBITRUM;

export {
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  ZKSYNC_ERA_GOERLI,
  ARBITRUM,
  CHAINS,
  ChainId,
};
