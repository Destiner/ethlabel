import { writeFile } from 'node:fs/promises';

import { ChainId, fetch } from './sources/index.js';

const labels = await fetch();
for (const chainIdString in labels) {
  const chainId = parseInt(chainIdString) as ChainId;
  const string = JSON.stringify(labels[chainId], null, 2);
  await writeFile(`./labels/address/${chainId}.json`, string);
}
