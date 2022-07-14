import { Label, Source } from '../base.js';

class TestSource extends Source {
  async fetch(): Promise<Label[]> {
    return [
      {
        chainId: 1,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        value: 'Wrapped Ethereum',
        keywords: ['WETH'],
      },
    ];
  }
}

export default TestSource;
