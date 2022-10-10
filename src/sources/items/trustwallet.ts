import axios from 'axios';

import { getErc20Metadata } from '../../utils/fetch.js';
import { Label, LabelMap, Source } from '../base.js';
import {
  ChainId,
  ETHEREUM,
  OPTIMISM,
  POLYGON,
  ARBITRUM,
  CHAINS,
} from '../chains.js';

interface TreeResponse {
  sha: string;
  url: string;
  tree: Tree[];
}

interface Tree {
  path: string;
  sha: string;
}

const githubClient = axios.create({
  baseURL: 'https://api.github.com/repos/trustwallet/assets/git/trees/',
});

class TrustwalletSource extends Source {
  async fetch(): Promise<LabelMap> {
    const labels: LabelMap = {
      [ETHEREUM]: {},
      [OPTIMISM]: {},
      [POLYGON]: {},
      [ARBITRUM]: {},
    };
    for (const chainId of CHAINS) {
      const assets = await this.#getAssets(chainId);
      const chainMetadata = await getErc20Metadata(chainId, assets);
      for (const address in chainMetadata) {
        const { name, symbol } = chainMetadata[address];
        if (!name || !symbol) {
          continue;
        }
        const label: Label = {
          label: name,
          keywords: [symbol],
          type: 'erc20',
        };
        labels[chainId][address] = label;
      }
    }
    return labels;
  }

  async #getAssets(chainId: ChainId): Promise<string[]> {
    function getChainName(chainId: ChainId): string {
      switch (chainId) {
        case ETHEREUM:
          return 'ethereum';
        case OPTIMISM:
          return 'optimism';
        case POLYGON:
          return 'polygon';
        case ARBITRUM:
          return 'arbitrum';
      }
    }

    const rootDir = await githubClient.get<TreeResponse>('master');
    const blockchainsSha = rootDir.data.tree.find(
      (item) => item.path === 'blockchains',
    )?.sha;
    if (!blockchainsSha) {
      return [];
    }
    const blockchainsDir = await githubClient.get<TreeResponse>(blockchainsSha);
    const chainName = getChainName(chainId);
    const chainSha = blockchainsDir.data.tree.find(
      (item) => item.path === chainName,
    )?.sha;
    if (!chainSha) {
      return [];
    }
    const chainDir = await githubClient.get<TreeResponse>(chainSha);
    const assetsSha = chainDir.data.tree.find(
      (item) => item.path === 'assets',
    )?.sha;
    if (!assetsSha) {
      return [];
    }
    const assetsDir = await githubClient.get<TreeResponse>(assetsSha);
    return assetsDir.data.tree.map((item) => item.path.toLowerCase());
  }
}

export default TrustwalletSource;
