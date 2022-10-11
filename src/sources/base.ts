import { ChainId } from './chains.js';

type LabelType = 'erc20' | 'uniswap-v3-pool';

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
