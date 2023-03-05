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
      [ARBITRUM]: {
        '0xc35dadb65012ec5796536bd9864ed8773abc74c4': {
          value: 'Sushiswap V1: Factory',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
        '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506': {
          value: 'Sushiswap V1: Router',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
        '0x74c764d41b77dbbb4fe771dab1939b00b146894a': {
          value: 'Sushiswap V1: BentoBox',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
      },
      [ETHEREUM]: {
        '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac': {
          value: 'Sushiswap V1: Factory',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
        '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': {
          value: 'Sushiswap V1: Router',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
        '0xf5bce5077908a1b7370b9ae04adc565ebd643966': {
          value: 'Sushiswap V1: BentoBox',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
      },
      [OPTIMISM]: {},
      [ZKSYNC_ERA_GOERLI]: {},
      [POLYGON]: {
        '0xc35dadb65012ec5796536bd9864ed8773abc74c4': {
          value: 'Sushiswap V1: Factory',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
        '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506': {
          value: 'Sushiswap V1: Router',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
        '0x0319000133d3ada02600f0875d2cf03d442c3367': {
          value: 'Sushiswap V1: BentoBox',
          keywords: [],
          type: 'sushiswap-v1-misc',
        },
      },
    };
  }
}

export default Source;
