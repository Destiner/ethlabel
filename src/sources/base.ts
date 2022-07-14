import { ChainId } from './chains.js';

interface Label {
  chainId: ChainId;
  address: string;
  value: string;
}

abstract class Source {
  abstract fetch(): Promise<Label[]>;
}

export { Label, Source };
