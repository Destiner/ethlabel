import { Source, Label } from './base.js';
import { ARBITRUM, ETHEREUM, OPTIMISM, POLYGON, ChainId } from './chains.js';
import TestSource from './items/test.js';
import TokenlistSource from './items/tokenlists.js';

async function fetch(): Promise<Label[]> {
  const allLabels: Label[] = [];
  for (const source of sources) {
    const sourceLabels = await source.fetch();
    for (const sourceLabel of sourceLabels) {
      allLabels.push(sourceLabel);
    }
  }
  return allLabels;
}

const sources: Source[] = [new TestSource(), new TokenlistSource()];

export { ARBITRUM, ETHEREUM, OPTIMISM, POLYGON, ChainId, Label, fetch };
