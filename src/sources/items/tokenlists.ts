import axios from 'axios';
import 'dotenv/config';
import { Call, Contract, Provider } from 'ethcall';
import * as ethers from 'ethers';

import erc20Abi from '../../abi/erc20.js';
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

interface MetadataWithCount {
  count: number;
  address: string;
  name: string;
  symbol: string;
}

interface FetchError {
  code: ethers.errors;
}

type Metadata = Omit<MetadataWithCount, 'count'>;

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
  'https://t2crtokens.eth.link/',
];

class TokenlistSource extends Source {
  async fetch(): Promise<Label[]> {
    const labels: Label[] = [];
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
          if (!assets[chainId][token.address]) {
            assets[chainId][token.address] = {
              count: 0,
              address: token.address,
              name: token.name,
              symbol: token.symbol,
            };
          }
          assets[chainId][token.address].count++;
        }
      }
      const chainTokenlistAssets = Object.values(assets[chainId]);
      chainTokenlistAssets.sort((a, b) =>
        a.count === b.count ? a.name.localeCompare(b.name) : b.count - a.count,
      );
      const chainAssets = await this.#getMetadata(
        chainId,
        chainTokenlistAssets,
      );
      for (const asset of chainAssets) {
        const label = {
          address: asset.address.toLowerCase(),
          value: asset.name,
          keywords: [asset.symbol],
          chainId,
        };
        labels.push(label);
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

  async #getMetadata(
    chainId: ChainId,
    assets: MetadataWithCount[],
  ): Promise<Metadata[]> {
    function callFunc(index: number): Call[] {
      const address = addresses[index];
      const contract = new Contract(address, erc20Abi);
      return [contract.name(), contract.symbol()];
    }

    function processFunc(results: (string | null)[]): {
      name: string | null;
      symbol: string | null;
    } {
      const name = results[0];
      const symbol = results[1];
      return {
        name,
        symbol,
      };
    }

    const key = process.env.ALCHEMY_KEY;
    const provider = new ethers.providers.AlchemyProvider(chainId, key);
    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);
    const addresses = assets.map((asset) => asset.address);
    const results = await this.#getNullableListState(
      addresses,
      callFunc,
      processFunc,
      provider,
    );

    return assets.map((asset) => {
      const { address, name, symbol } = asset;
      return {
        address,
        name: results[address].name || name,
        symbol: results[address].symbol || symbol,
      };
    });
  }

  async #getNullableListState<R, O>(
    inputs: string[],
    callFunc: (index: number) => Call[],
    processFunc: (results: (R | null)[]) => O,
    provider: ethers.providers.BaseProvider,
    block?: number,
  ): Promise<Record<string, O>> {
    const LIMIT = 50;

    const callMap = inputs.map((_row, index) => callFunc(index));
    const allCalls = Object.values(callMap).flat();
    const allResults = await this.#getNullableCallResults<R>(
      allCalls,
      LIMIT,
      provider,
      block,
    );

    let index = 0;
    const outputs: Record<string, O> = {};
    for (let i = 0; i < inputs.length; i++) {
      const callCount = callMap[i].length;
      const startIndex = index;
      const endIndex = index + callCount;
      index += callCount;
      const results = allResults.slice(startIndex, endIndex);
      const output = processFunc(results);
      outputs[inputs[i]] = output;
    }
    return outputs;
  }

  async #getNullableCallResults<T>(
    allCalls: Call[],
    limit: number,
    provider: ethers.providers.BaseProvider,
    block?: number,
  ): Promise<(T | null)[]> {
    const ethcallProvider = new Provider();
    await ethcallProvider.init(provider);

    const allResults: (T | null)[] = [];
    for (let i = 0; i < allCalls.length / limit; i++) {
      const startIndex = i * limit;
      const endIndex = Math.min((i + 1) * limit, allCalls.length);
      const calls = allCalls.slice(startIndex, endIndex);
      let results = null;
      while (!results) {
        try {
          const canFail = calls.map(() => true);
          results = await ethcallProvider.tryEach<T>(calls, canFail, block);
        } catch (e: unknown) {
          const error = e as FetchError;
          if (error.code === ethers.errors.TIMEOUT) {
            console.log(
              `Failed to fetch state, reason: ${error.code}, retrying`,
            );
          } else {
            throw e;
          }
        }
      }
      for (const result of results) {
        allResults.push(result);
      }
    }
    return allResults;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms, null));
}

export default TokenlistSource;
