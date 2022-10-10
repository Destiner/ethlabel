import axios from 'axios';
import 'dotenv/config';

import { getErc20Metadata } from '../../utils/fetch.js';
import { Label, LabelMap, Source } from '../base.js';
import { ARBITRUM, ChainId, ETHEREUM, OPTIMISM, POLYGON } from '../chains.js';

interface TokenList {
  name: string;
  tokens: Token[];
}

interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface Metadata {
  address: string;
  name: string;
  symbol: string;
}

interface MetadataWithCount extends Metadata {
  count: number;
}

const chains: ChainId[] = [ETHEREUM, OPTIMISM, POLYGON, ARBITRUM];

const listUrls: string[] = [
  'https://tokens.coingecko.com/uniswap/all.json',
  'https://tokens.coingecko.com/polygon-pos/all.json',
  'https://api.coinmarketcap.com/data-api/v3/uniswap/all.json',
  'https://static.optimism.io/optimism.tokenlist.json',
  'https://bridge.arbitrum.io/token-list-42161.json',
  'https://tokens.uniswap.org',
  'https://token-list.sushi.com',
  'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/listed.tokenlist.json',
  'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/polygon.listed.tokenlist.json',
  'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/arbitrum.listed.tokenlist.json',
  'https://unpkg.com/quickswap-default-token-list/build/quickswap-default.tokenlist.json',
  'https://t2crtokens.eth.limo',
];

class TokenlistSource extends Source {
  async fetch(): Promise<LabelMap> {
    const labels: LabelMap = {
      [ARBITRUM]: {},
      [ETHEREUM]: {},
      [OPTIMISM]: {},
      [POLYGON]: {},
    };
    const lists: TokenList[] = [];
    for (const listUrl of listUrls) {
      const list = await this.#getList(listUrl);
      if (!list) {
        continue;
      }
      lists.push(list);
    }
    const assets: Record<ChainId, Record<string, MetadataWithCount>> = {
      [ETHEREUM]: {},
      [OPTIMISM]: {},
      [POLYGON]: {},
      [ARBITRUM]: {},
    };
    for (const chainId of chains) {
      for (const list of lists) {
        const tokens = list.tokens.filter((token) => token.chainId === chainId);
        for (const token of tokens) {
          const address = token.address.toLowerCase();
          if (!assets[chainId][address]) {
            assets[chainId][address] = {
              count: 0,
              address,
              name: token.name,
              symbol: token.symbol,
            };
          }
          assets[chainId][address].count++;
        }
      }
      const chainTokenlistAssets = Object.values(assets[chainId]);
      chainTokenlistAssets.sort((a, b) =>
        a.count === b.count ? a.name.localeCompare(b.name) : b.count - a.count,
      );
      const chainTokenlistAssetAddresses = chainTokenlistAssets.map(
        (asset) => asset.address,
      );
      const chainMetadata = await getErc20Metadata(
        chainId,
        chainTokenlistAssetAddresses,
      );
      const chainAssets = chainTokenlistAssets.map((asset) => {
        const { address, name, symbol } = asset;
        return {
          address,
          name: chainMetadata[address].name || name,
          symbol: chainMetadata[address].symbol || symbol,
        };
      });
      for (const asset of chainAssets) {
        const label: Label = {
          label: asset.name,
          keywords: [asset.symbol],
          type: 'erc20',
        };
        labels[chainId][asset.address.toLowerCase()] = label;
      }
    }
    return labels;
  }

  async #getList(url: string): Promise<TokenList | null> {
    let tries = 0;
    for (;;) {
      const delay = 1000 * 2 ** tries;
      if (tries > 10) {
        return null;
      }
      await sleep(delay);
      tries++;
      try {
        const listResponse = await axios.get(url);
        if (listResponse.status !== 200) {
          continue;
        }
        return listResponse.data as TokenList;
      } catch (e) {
        continue;
      }
    }
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms, null));
}

export default TokenlistSource;
