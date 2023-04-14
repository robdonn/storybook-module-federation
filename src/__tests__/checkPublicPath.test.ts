import { WebpackConfig } from '../plugin';
import { checkPublicPath } from '../checkPublicPath';

const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const exit = jest
  .spyOn(process, 'exit')
  .mockImplementation(() => undefined as never);

describe('checkPublicPath', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should leave output untouched if it does not exist', () => {
    const config = {} as WebpackConfig;

    checkPublicPath(config, {});

    expect(config?.output?.publicPath).toBeUndefined();
  });

  it.each(<[string, WebpackConfig][]>[
    ['publicPath is undefined', { output: {} }],
    ['publicPath is "auto"', { output: { publicPath: '' } }],
  ])('should make publicPath an empty string when %s', (_, config) => {
    checkPublicPath(config, {});

    expect(typeof config?.output?.publicPath).toEqual('string');
    expect(config?.output?.publicPath).toEqual('');
  });

  it('should NOT throw warning when publicPath is url without protocol', () => {
    const config: WebpackConfig = {
      entry: [],
      output: { publicPath: '//localhost:1234' },
    };
    checkPublicPath(config, {});
    expect(warn).toHaveBeenCalledTimes(0);
  });
});
