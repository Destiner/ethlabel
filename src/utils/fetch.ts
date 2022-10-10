import axios from 'axios';
import { Call, Contract, Provider } from 'ethcall';
import { ethers } from 'ethers';

import erc20Abi from '../abi/erc20.js';
import { ChainId } from '../sources/index.js';

interface Erc20Metadata {
  name: string | null;
  symbol: string | null;
}

interface FetchError {
  code: ethers.errors;
}

async function getSubgraphRecords<T>(
  url: string,
  entity: string,
  orderBy: string,
  fields: string[],
): Promise<T[]> {
  const subgraphClient = axios.create({
    baseURL: 'https://api.thegraph.com/subgraphs/name/',
    headers: { 'Content-Type': 'application/json' },
  });

  const records: T[] = [];
  const perPage = 1000;
  let page = 0;

  while (records.length === page * perPage) {
    const query = `
      query {
        ${entity}(
          first: ${perPage},
          skip: ${page * perPage},
          orderBy: ${orderBy},
          orderDirection: desc,
        ) {
          ${fields.join('\n')}
        }
      }
    `;
    const response = await subgraphClient.post(url, {
      query,
    });
    if (response.data.errors) {
      break;
    }
    const pageRecords: T[] = response.data.data[entity];
    for (const record of pageRecords) {
      records.push(record);
    }
    page++;
  }

  return records;
}

async function getErc20Metadata(
  chainId: ChainId,
  addresses: string[],
): Promise<Record<string, Erc20Metadata>> {
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
  const results = await getNullableListState(
    addresses,
    callFunc,
    processFunc,
    provider,
  );

  return results;
}

async function getNullableListState<R, O>(
  inputs: string[],
  callFunc: (index: number) => Call[],
  processFunc: (results: (R | null)[]) => O,
  provider: ethers.providers.BaseProvider,
  block?: number,
): Promise<Record<string, O>> {
  const LIMIT = 30;

  const callMap = inputs.map((_row, index) => callFunc(index));
  const allCalls = Object.values(callMap).flat();
  const allResults = await getNullableCallResults<R>(
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

async function getNullableCallResults<T>(
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
          console.log(`Failed to fetch state, reason: ${error.code}, retrying`);
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

export { getSubgraphRecords, getErc20Metadata };
