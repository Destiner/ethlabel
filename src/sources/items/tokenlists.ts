import axios from 'axios';

import { Label, Source } from '../base.js';
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

const lists: Record<ChainId, string[]> = {
  [ETHEREUM]: [
    'https://tokens.coingecko.com/uniswap/all.json',
    'https://api.coinmarketcap.com/data-api/v3/uniswap/all.json',
    'https://t2crtokens.eth.link/',
    'https://tokens.uniswap.org',
    'https://token-list.sushi.com',
    'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/listed.tokenlist.json',
  ],
  [OPTIMISM]: [
    'https://tokens.uniswap.org',
    'https://static.optimism.io/optimism.tokenlist.json',
  ],
  [POLYGON]: [
    'https://tokens.uniswap.org',
    'https://token-list.sushi.com',
    'https://tokens.coingecko.com/polygon-pos/all.json',
    'https://unpkg.com/quickswap-default-token-list/build/quickswap-default.tokenlist.json',
    'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/polygon.listed.tokenlist.json',
  ],
  [ARBITRUM]: [
    'https://tokens.uniswap.org',
    'https://token-list.sushi.com',
    'https://bridge.arbitrum.io/token-list-42161.json',
    'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/arbitrum.listed.tokenlist.json',
  ],
};

class TokenlistSource extends Source {
  async fetch(): Promise<Label[]> {
    const labels: Label[] = [];
    const chainIds = Object.keys(lists).map(
      (idString) => parseInt(idString) as ChainId,
    );
    for (const chainId of chainIds) {
      const chainLists = lists[chainId];
      for (const url of chainLists) {
        const list = await this.#getList(url, chainId);
        if (!list) {
          continue;
        }
        const listLabels: Label[] = list.tokens.map((token) => {
          return {
            address: token.address.toLowerCase(),
            value: token.name,
            keywords: [token.symbol],
            chainId,
          };
        });
        for (const label of listLabels) {
          labels.push(label);
        }
      }
    }
    return labels;
  }

  async #getList(url: string, chainId: number): Promise<TokenList | null> {
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
        const fullList = listResponse.data as TokenList;
        const list = {
          ...fullList,
          tokens: fullList.tokens.filter((token) => token.chainId === chainId),
        };
        return list;
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
