import { container } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { StorybookConfigInput, WebpackConfig } from '../plugin';
import { withStorybookModuleFederation } from '../main';

jest.mock('webpack', () => ({
  container: {
    ModuleFederationPlugin: jest.fn(),
  },
}));
jest.mock('webpack-virtual-modules');

describe('withStorybookModuleFederation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
    const wrapper = withStorybookModuleFederation(dummyModuleFederationConfig);

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
