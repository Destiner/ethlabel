const ETHEREUM = 1;
const OPTIMISM = 10;
const POLYGON = 137;
const ARBITRUM = 42161;

type ChainId =
  | typeof ETHEREUM
  | typeof OPTIMISM
  | typeof POLYGON
  | typeof ARBITRUM;

export { ETHEREUM, OPTIMISM, POLYGON, ARBITRUM, ChainId };
