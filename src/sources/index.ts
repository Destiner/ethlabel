import { Source, Label, LabelType, LabelMap } from './base.js';
import {
  ARBITRUM,
  ETHEREUM,
  OPTIMISM,
  ZKSYNC_ERA_GOERLI,
  POLYGON,
  ChainId,
} from './chains.js';
import StaticSource from './items/static.js';
import SushiswapV1MiscSource from './items/sushiswap/v1-misc.js';
import SushiswapV1PoolSource from './items/sushiswap/v1-pools.js';
import TokenlistSource from './items/tokenlists.js';
import UniswapV2MiscSource from './items/uniswap/v2-misc.js';
import UniswapV2PoolSource from './items/uniswap/v2-pools.js';
import UniswapV3MiscSource from './items/uniswap/v3-misc.js';
import UniswapV3PoolSource from './items/uniswap/v3-pools.js';
import WrappedSource from './items/wrapped.js';

async function fetch(): Promise<LabelMap> {
  const allLabels: LabelMap = {
    [ARBITRUM]: {},
    [ETHEREUM]: {},
    [OPTIMISM]: {},
    [ZKSYNC_ERA_GOERLI]: {},
    [POLYGON]: {},
  };
  for (const source of sources) {
    const sourceLabels = await source.fetch(allLabels);
    for (const chain in sourceLabels) {
      const chainId = parseInt(chain) as ChainId;
      const chainLabels = sourceLabels[chainId];
      for (const address in chainLabels) {
        allLabels[chainId][address] = sourceLabels[chainId][address];
      }
    }
  }
  return allLabels;
}

const sources: Source[] = [
  new TokenlistSource(),
  new StaticSource(),
  new SushiswapV1MiscSource(),
  new SushiswapV1PoolSource(),
  new UniswapV2MiscSource(),
  new UniswapV2PoolSource(),
  new UniswapV3MiscSource(),
  new UniswapV3PoolSource(),
  new WrappedSource(),
];

export {
  ARBITRUM,
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  ChainId,
  Label,
  LabelType,
  LabelMap,
  fetch,
};
