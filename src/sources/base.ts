import { ChainId } from './chains.js';

type LabelType =
  | 'wrapped'
  | 'erc20'
  | 'uniswap-v2-pool'
  | 'uniswap-v2-misc'
  | 'uniswap-v3-pool'
  | 'uniswap-v3-misc';

type ChainLabelMap = Record<string, Label>;
type LabelMap = Record<ChainId, ChainLabelMap>;

interface Label {
  value: string;
  keywords: string[];
  type: LabelType;
}

abstract class Source {
  abstract fetch(previousLabels: LabelMap): Promise<LabelMap>;
}

export { ChainLabelMap, LabelType, LabelMap, Label, Source };
