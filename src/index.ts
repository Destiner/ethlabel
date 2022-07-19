import { writeFile } from 'node:fs/promises';

import {
  ARBITRUM,
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  ChainId,
  fetch,
} from './sources/index.js';

interface LabelItem {
  label: string;
  keywords: string[];
}

const labels = await fetch();
const labelByChain: Record<ChainId, Record<string, LabelItem>> = {
  [ETHEREUM]: {},
  [OPTIMISM]: {},
  [POLYGON]: {},
  [ARBITRUM]: {},
};
for (const label of labels) {
  const { address, value, keywords } = label;
  labelByChain[label.chainId][address] = {
    label: value,
    keywords,
  };
}
for (const chainIdString in labelByChain) {
  const chainId = parseInt(chainIdString) as ChainId;
  const string = JSON.stringify(labelByChain[chainId], null, 2);
  await writeFile(`./labels/address/${chainId}.json`, string);
}
