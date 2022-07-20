import { Source, Label } from './base.js';
import { ARBITRUM, ETHEREUM, OPTIMISM, POLYGON, ChainId } from './chains.js';
import TokenlistSource from './items/tokenlists.js';
// import TrustwalletSource from './items/trustwallet.js';

async function fetch(): Promise<Label[]> {
  const allLabels: Label[] = [];
  for (const source of sources) {
    const sourceLabels = await source.fetch();
    const uniqueSourceLabels = sourceLabels.filter(
      (sourceLabel) =>
        !allLabels.find(
          (label) =>
            label.chainId === sourceLabel.chainId &&
            label.address === sourceLabel.address,
        ),
    );
    for (const sourceLabel of uniqueSourceLabels) {
      allLabels.push(sourceLabel);
    }
  }
  return allLabels;
}

const sources: Source[] = [
  new TokenlistSource(),
  // new TrustwalletSource()
];

export { ARBITRUM, ETHEREUM, OPTIMISM, POLYGON, ChainId, Label, fetch };
