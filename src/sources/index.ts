import { ChainId, Source, Label } from './base.js';
import TestSource from './items/test.js';

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

const sources: Source[] = [new TestSource()];

export { ChainId, Label, fetch };
