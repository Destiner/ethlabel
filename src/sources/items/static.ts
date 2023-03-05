import { LabelMap, Source } from '../base.js';
import {
  ARBITRUM,
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  ZKSYNC_ERA_GOERLI,
} from '../chains.js';

class StaticSource extends Source {
  async fetch(): Promise<LabelMap> {
    const labels: LabelMap = {
      [ARBITRUM]: {},
      [ETHEREUM]: {},
      [OPTIMISM]: {},
      [ZKSYNC_ERA_GOERLI]: {
        '0x0faf6df7054946141266420b43783387a78d82a9': {
          value: 'USD Coin',
          keywords: ['USDC'],
          type: 'erc20',
        },
        '0x3e7676937a7e96cfb7616f255b9ad9ff47363d4b': {
          value: 'DAI Stablecoin',
          keywords: ['DAI'],
          type: 'erc20',
        },
        '0x40609141db628beee3bfab8034fc2d8278d0cc78': {
          value: 'Chainlink',
          keywords: ['LINK'],
          type: 'erc20',
        },
        '0x0bfce1d53451b4a8175dd94e6e029f7d8a701e9c': {
          value: 'Wrapped Bitcoin',
          keywords: ['wBTC'],
          type: 'erc20',
        },
      },
      [POLYGON]: {},
    };

    return labels;
  }
}

export default StaticSource;
