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

  it.each(<[string, WebpackConfig][]>[
    ['output is undefined', {}],
    ['publicPath is undefined', { output: {} }],
    ['publicPath is empty string', { output: { publicPath: '' } }],
  ])('should make publicPath undefined when %s', (_, config) => {
    checkPublicPath(config, {});

    expect(config?.output?.publicPath).toBeUndefined();
  });

  it.each(<[string, string][]>[
    ['relative path', './path'],
    ['root path', '/path'],
  ])('should warn when publicPath is %s', (_, publicPath) => {
    const config: WebpackConfig = { entry: [], output: { publicPath } };
    checkPublicPath(config, {});
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenNthCalledWith(
      1,
      'Using a relative or root publicPath may cause issues with loading federated modules.\nIt is advised to use the full host name if known, or set to "undefined" and allow Webpack to determine it for you.'
    );

    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenNthCalledWith(1, 1);
  });

  it('should warn but NOT exit if "ignorePublicPath" option is true', () => {
    const config: WebpackConfig = {
      entry: [],
      output: { publicPath: './path' },
    };
    checkPublicPath(config, { ignorePublicPath: true });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenNthCalledWith(
      1,
      'Using a relative or root publicPath may cause issues with loading federated modules.\nIt is advised to use the full host name if known, or set to "undefined" and allow Webpack to determine it for you.'
    );

    expect(exit).toHaveBeenCalledTimes(0);
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
