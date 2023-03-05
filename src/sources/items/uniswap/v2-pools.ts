import {
  ChainLabelMap,
  LabelMap,
  Source as BaseSource,
} from '../../../sources/base.js';
import {
  ARBITRUM,
  ChainId,
  CHAINS,
  ETHEREUM,
  OPTIMISM,
  ZKSYNC_ERA_GOERLI,
  POLYGON,
} from '../../../sources/chains.js';
import { getSubgraphRecords } from '../../../utils/fetch.js';

interface PoolRaw {
  id: string;
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
}

interface Pool {
  address: string;
  token0: string;
  token1: string;
}

class Source extends BaseSource {
  async fetch(previousLabels: LabelMap): Promise<LabelMap> {
    const labels: LabelMap = {
      [ARBITRUM]: {},
      [ETHEREUM]: {},
      [OPTIMISM]: {},
      [ZKSYNC_ERA_GOERLI]: {},
      [POLYGON]: {},
    };
    for (const chain of CHAINS) {
      const chainPreviousLabels = previousLabels[chain];
      const chainLabels = await this.fetchChain(chain, chainPreviousLabels);
      labels[chain] = chainLabels;
    }

    return labels;
  }

  private async fetchChain(
    chain: ChainId,
    previousLabels: ChainLabelMap,
  ): Promise<ChainLabelMap> {
    const url = this.getSubgraphUrl(chain);
    if (!url) {
      return {};
    }
    const records = await getSubgraphRecords<PoolRaw>(
      url,
      'pairs',
      'reserveUSD',
      ['id', 'token0 { id }', 'token1 { id }'],
    );

    const pools: Pool[] = records.map((record) => {
      return {
        address: record.id,
        token0: record.token0.id,
        token1: record.token1.id,
      };
    });

    return Object.fromEntries(
      pools.map((pool) => {
        const value = getPoolLabel(pool, previousLabels);
        const symbol = getPoolSymbol(pool, previousLabels);
        return [
          pool.address,
          {
            value,
            keywords: [symbol],
            type: 'uniswap-v2-pool',
          },
        ];
      }),
    );
  }

  private getSubgraphUrl(chain: ChainId): string | null {
    switch (chain) {
      case ETHEREUM:
        return 'uniswap/uniswap-v2';
      case OPTIMISM:
        return null;
      case POLYGON:
        return null;
      case ZKSYNC_ERA_GOERLI:
        return null;
      case ARBITRUM:
        return null;
    }
  }
}

function getPoolLabel(pool: Pool, previousLabels: ChainLabelMap): string {
  const token0Label = previousLabels[pool.token0];
  const token1Label = previousLabels[pool.token1];
  if (!token0Label || !token1Label) {
    return 'Uniswap V2: Pool';
  }
  if (token0Label.type !== 'erc20' || token1Label.type !== 'erc20') {
    return 'Uniswap V2: Pool';
  }
  const token0Symbol = token0Label.keywords[0];
  const token1Symbol = token1Label.keywords[0];
  return `Uniswap V2 ${token0Symbol}/${token1Symbol}`;
}

function getPoolSymbol(pool: Pool, previousLabels: ChainLabelMap): string {
  const token0Label = previousLabels[pool.token0];
  const token1Label = previousLabels[pool.token1];
  if (!token0Label || !token1Label) {
    return 'UNI-V2';
  }
  if (token0Label.type !== 'erc20' || token1Label.type !== 'erc20') {
    return 'UNI-V2';
  }
  const token0Symbol = token0Label.keywords[0];
  const token1Symbol = token1Label.keywords[0];
  return `UNI-V2-${token0Symbol}-${token1Symbol}`;
}

export default Source;
