import { container } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { StorybookConfigInput, WebpackConfig } from '../plugin';
import { withStorybookModuleFederation, checkPublicPath } from '../main';

jest.mock('webpack', () => ({
  container: {
    ModuleFederationPlugin: jest.fn(),
  },
}));
jest.mock('webpack-virtual-modules');

const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('storybook-module-federation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('withStorybookModuleFederation', () => {
    it('should return a wrapper function', () => {
      expect(withStorybookModuleFederation({})).toEqual(expect.any(Function));
    });

    it.each([
      ['core is undefined', undefined],
      ['core does not have builder property', {}],
      ['builder property is not set to "webpack5"', { builder: 'webpack4' }],
    ])(
      'should throw error if storybook is not configured for webpack 5 - %s',
      (_, core) => {
        const wrapper = withStorybookModuleFederation({});

        const storybookConfig: StorybookConfigInput = {};
        storybookConfig.core = core;

        expect(() => wrapper(storybookConfig)).toThrowError(
          new Error(
            'Webpack 5 required: Configure Storybook to use the webpack5 builder'
          )
        );
      }
    );

    it('should update the entry file for the webpack configuration', () => {
      const wrapper = withStorybookModuleFederation({});

      const dummyWebpackConfig = {
        entry: ['first', 'second'],
      };

      const storybookConfig = wrapper({
        core: {
          builder: 'webpack5',
        },
      });

      const config = storybookConfig.webpackFinal(dummyWebpackConfig);

      expect(config.entry).toEqual(['./__entry.js']);
    });

    it('should add virtual modules plugin with entry configuration', () => {
      const wrapper = withStorybookModuleFederation({});

      const dummyWebpackConfig = {
        entry: ['first', 'second'],
      };

      const storybookConfig = wrapper({
        core: {
          builder: 'webpack5',
        },
      });

      const config = storybookConfig.webpackFinal(dummyWebpackConfig);

      expect(config.plugins?.[0]).toBeInstanceOf(VirtualModulesPlugin);

      expect(VirtualModulesPlugin).toHaveBeenCalledTimes(1);
      expect(VirtualModulesPlugin).toHaveBeenNthCalledWith(1, {
        './__entry.js': `import('./__bootstrap.js');`,
        './__bootstrap.js': `import 'first';\nimport 'second';`,
      });
    });

    it('should add module federation plugin with provided configuration', () => {
      const dummyModuleFederationConfig = {
        name: 'dummyConfig',
      };
      const wrapper = withStorybookModuleFederation(
        dummyModuleFederationConfig
      );

      const dummyWebpackConfig = {
        entry: ['first', 'second'],
      };

      const storybookConfig = wrapper({
        core: {
          builder: 'webpack5',
        },
      });

      const config = storybookConfig.webpackFinal(dummyWebpackConfig);

      expect(config.plugins?.[1]).toBeInstanceOf(
        container.ModuleFederationPlugin
      );

      expect(container.ModuleFederationPlugin).toHaveBeenCalledTimes(1);
      expect(container.ModuleFederationPlugin).toHaveBeenNthCalledWith(
        1,
        dummyModuleFederationConfig
      );
    });
  });

  describe('checkPublicPath', () => {
    it.each(<[string, WebpackConfig][]>[
      ['output is undefined', {}],
      ['publicPath is undefined', { output: {} }],
      ['publicPath is empty string', { output: { publicPath: '' } }],
    ])('should make publicPath undefined when %s', (_, config) => {
      checkPublicPath(config);

      expect(config?.output?.publicPath).toBeUndefined();
    });

    it.each(<[string, string][]>[
      ['relative path', './path'],
      ['root path', '/path'],
    ])('should warn when publicPath is %s', (_, publicPath) => {
      const config: WebpackConfig = { entry: [], output: { publicPath } };
      checkPublicPath(config);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenNthCalledWith(
        1,
        'Using a relative or root publicPath may cause issues with loading federated modules.\nIt is advised to use the full host name if known, or set to "undefined" and allow Webpack to determine it for you.'
      );
    });

    it('should NOT throw warning when publicPath is url without protocol', () => {
      const config: WebpackConfig = {
        entry: [],
        output: { publicPath: '//localhost:1234' },
      };
      checkPublicPath(config);
      expect(warn).toHaveBeenCalledTimes(0);
    });
  });
});
