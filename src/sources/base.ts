type ChainId = 1;

interface Label {
  chainId: ChainId;
  address: string;
  value: string;
}

abstract class Source {
  abstract fetch(): Promise<Label[]>;
}

export { ChainId, Label, Source };
