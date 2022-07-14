import { writeFile } from 'node:fs/promises';

import { ChainId, fetch } from './sources/index.js';

const labels = await fetch();
const labelByChain: Record<ChainId, Record<string, string>> = {
  1: {},
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
