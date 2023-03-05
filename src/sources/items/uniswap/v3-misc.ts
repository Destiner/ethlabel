import {
  ChainLabelMap,
  LabelMap,
  Source as BaseSource,
} from '../../../sources/base.js';
import {
  ARBITRUM,
  ETHEREUM,
  OPTIMISM,
  ZKSYNC_ERA_GOERLI,
  POLYGON,
} from '../../../sources/chains.js';

interface Contract {
  name: string;
  address: string;
}

const contracts: Contract[] = [
  { name: 'Factory', address: '0x1f98431c8ad98523631ae4a59f267346ea31f984' },
  {
    name: 'Multicall 2',
    address: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  },
  {
    name: 'Proxy Admin',
    address: '0xb753548f6e010e7e680ba186f9ca1bdab2e90cf2',
  },
  { name: 'Tick Lens', address: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' },
  { name: 'Quoter', address: '0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6' },
  {
    name: 'Swap Router',
    address: '0xe592427a0aece92de3edee1f18e0157c05861564',
  },
  {
    name: 'NFT Descriptor',
    address: '0x42b24a95702b9986e82d421cc3568932790a48ec',
  },
  {
    name: 'Nonfungible Token Position Descriptor',
    address: '0x91ae842a5ffd8d12023116943e72a606179294f3',
  },
  {
    name: 'Transparent Upgradeable Proxy',
    address: '0xee6a57ec80ea46401049e92587e52f5ec1c24785',
  },
  {
    name: 'Nonfungible Position Manager',
    address: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
  },
  { name: 'Migrator', address: '0xa5644e29708357803b5a882d272c41cc0df92b34' },
];

class Source extends BaseSource {
  async fetch(): Promise<LabelMap> {
    return {
      [ARBITRUM]: this.getContracts(),
      [ETHEREUM]: this.getContracts(),
      [OPTIMISM]: this.getContracts(),
      [ZKSYNC_ERA_GOERLI]: {},
      [POLYGON]: this.getContracts(),
    };
  }

  private getContracts(): ChainLabelMap {
    return Object.fromEntries(
      contracts.map((contract) => [
        contract.address,
        {
          value: `Uniswap V3: ${contract.name}`,
          keywords: [],
          type: 'uniswap-v3-misc',
        },
      ]),
    );
  }
}

export default Source;
