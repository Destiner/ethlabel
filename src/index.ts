import { writeFile } from 'node:fs/promises';

import {
  ARBITRUM,
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  ChainId,
  fetch,
} from './sources/index.js';

const labels = await fetch();
const labelByChain: Record<ChainId, Record<string, string>> = {
  [ETHEREUM]: {},
  [OPTIMISM]: {},
  [POLYGON]: {},
  [ARBITRUM]: {},
};
for (const label of labels) {
  const { address, value } = label;
  labelByChain[label.chainId][address] = value;
}
for (const chainIdString in labelByChain) {
  const chainId = parseInt(chainIdString) as ChainId;
  const string = JSON.stringify(labelByChain[chainId], null, 2);
  await writeFile(`./labels/${chainId}.json`, string);
}
