import { LabelMap, Source } from '../base.js';
import { ARBITRUM, ETHEREUM, OPTIMISM, POLYGON } from '../chains.js';

class WrappedSource extends Source {
  async fetch(): Promise<LabelMap> {
    const labels: LabelMap = {
      [ARBITRUM]: {
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
          value: 'Wrapped Ether',
          keywords: ['WETH'],
          type: 'wrapped',
        },
      },
      [ETHEREUM]: {
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
          value: 'Wrapped Ether',
          keywords: ['WETH'],
          type: 'wrapped',
        },
      },
      [OPTIMISM]: {
        '0x4200000000000000000000000000000000000006': {
          value: 'Wrapped Ether',
          keywords: ['WETH'],
          type: 'wrapped',
        },
      },
      [POLYGON]: {
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': {
          value: 'Wrapped Matic',
          keywords: ['WMATIC'],
          type: 'wrapped',
        },
      },
    };

    return labels;
  }
}

export default WrappedSource;
