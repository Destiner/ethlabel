import { Source, Label, LabelType, LabelMap } from './base.js';
import { ARBITRUM, ETHEREUM, OPTIMISM, POLYGON, ChainId } from './chains.js';
import TokenlistSource from './items/tokenlists.js';
// import TrustwalletSource from './items/trustwallet.js';

async function fetch(): Promise<LabelMap> {
  const allLabels: LabelMap = {
    [ARBITRUM]: {},
    [ETHEREUM]: {},
    [OPTIMISM]: {},
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
  // new TrustwalletSource(),
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
