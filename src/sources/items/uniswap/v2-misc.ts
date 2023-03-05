import { LabelMap, Source as BaseSource } from '../../../sources/base.js';
import {
  ARBITRUM,
  ETHEREUM,
  OPTIMISM,
  ZKSYNC_ERA_GOERLI,
  POLYGON,
} from '../../../sources/chains.js';

class Source extends BaseSource {
  async fetch(): Promise<LabelMap> {
    return {
      [ARBITRUM]: {},
      [ETHEREUM]: {
        '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f': {
          value: 'Uniswap V2: Factory',
          keywords: [],
          type: 'uniswap-v2-misc',
        },
        '0xf164fc0ec4e93095b804a4795bbe1e041497b92a': {
          value: 'Uniswap V2: Router 01',
          keywords: [],
          type: 'uniswap-v2-misc',
        },
        '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
          value: 'Uniswap V2: Router 02',
          keywords: [],
          type: 'uniswap-v2-misc',
        },
      },
      [OPTIMISM]: {},
      [ZKSYNC_ERA_GOERLI]: {},
      [POLYGON]: {},
    };
  }
}

export default Source;
