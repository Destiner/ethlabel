import { ChainLabelMap, LabelMap, Source } from '../../sources/base.js';
import {
  ARBITRUM,
  ChainId,
  CHAINS,
  ETHEREUM,
  OPTIMISM,
  POLYGON,
} from '../../sources/chains.js';
import { getSubgraphRecords } from '../../utils/fetch.js';

interface PoolRaw {
  id: string;
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
  feeTier: string;
}

interface Pool {
  address: string;
  token0: string;
  token1: string;
  fee: number;
}

class UniswapSource extends Source {
  async fetch(previousLabels: LabelMap): Promise<LabelMap> {
    const labels: LabelMap = {
      [ARBITRUM]: {},
      [ETHEREUM]: {},
      [OPTIMISM]: {},
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
    const records = await getSubgraphRecords<PoolRaw>(
      url,
      'pools',
      'totalValueLockedUSD',
      ['id', 'token0 { id }', 'token1 { id }', 'feeTier'],
    );

    const pools: Pool[] = records.map((record) => {
      return {
        address: record.id,
        token0: record.token0.id,
        token1: record.token1.id,
        fee: parseInt(record.feeTier) / 1000000,
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
            type: 'uniswap-v3-pool',
          },
        ];
      }),
    );
  }

  private getSubgraphUrl(chain: ChainId): string {
    switch (chain) {
      case ETHEREUM:
        return 'uniswap/uniswap-v3';
      case OPTIMISM:
        return 'ianlapham/optimism-post-regenesis';
      case POLYGON:
        return 'ianlapham/uniswap-v3-polygon';
      case ARBITRUM:
        return 'ianlapham/arbitrum-dev';
    }
  }
}

function getPoolLabel(pool: Pool, previousLabels: ChainLabelMap): string {
  const token0Label = previousLabels[pool.token0];
  const token1Label = previousLabels[pool.token1];
  if (!token0Label || !token1Label) {
    return 'Uniswap V3: Pool';
  }
  if (token0Label.type !== 'erc20' || token1Label.type !== 'erc20') {
    return 'Uniswap V3: Pool';
  }
  const token0Symbol = token0Label.keywords[0];
  const token1Symbol = token1Label.keywords[0];
  const feeLabel = `${100 * pool.fee}%`;
  return `Uniswap V3 ${token0Symbol}/${token1Symbol} ${feeLabel}`;
}

function getPoolSymbol(pool: Pool, previousLabels: ChainLabelMap): string {
  const token0Label = previousLabels[pool.token0];
  const token1Label = previousLabels[pool.token1];
  if (!token0Label || !token1Label) {
    return 'UNI-V3';
  }
  if (token0Label.type !== 'erc20' || token1Label.type !== 'erc20') {
    return 'UNI-V3';
  }
  const token0Symbol = token0Label.keywords[0];
  const token1Symbol = token1Label.keywords[0];
  const feeLabel = `${1000000 * pool.fee}`;
  return `UNI-V3-${token0Symbol}-${token1Symbol}-${feeLabel}`;
}

export default UniswapSource;
