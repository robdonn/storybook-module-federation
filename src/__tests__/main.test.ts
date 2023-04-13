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

  it('should update the entry file for the webpack configuration', async () => {
    const wrapper = withStorybookModuleFederation({});

    const dummyWebpackConfig = {
      entry: ['first', 'second'],
    };

    const storybookConfig = wrapper({
      core: {
        builder: 'webpack5',
      },
    });

    const config = await storybookConfig.webpackFinal(dummyWebpackConfig);

    expect(config.entry).toEqual(['./__entry.js']);
  });

  it('should add virtual modules plugin with entry configuration', async () => {
    const wrapper = withStorybookModuleFederation({});

    const dummyWebpackConfig = {
      entry: ['first', 'second'],
    };

    const storybookConfig = wrapper({
      core: {
        builder: 'webpack5',
      },
    });

    const config = await storybookConfig.webpackFinal(dummyWebpackConfig);

    expect(config.plugins?.[0]).toBeInstanceOf(VirtualModulesPlugin);

    expect(VirtualModulesPlugin).toHaveBeenCalledTimes(1);
    expect(VirtualModulesPlugin).toHaveBeenNthCalledWith(1, {
      './__entry.js': `import('./__bootstrap.js');`,
      './__bootstrap.js': `import 'first';\nimport 'second';`,
    });
  });

  it('should add module federation plugin with provided configuration', async () => {
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

    const config = await storybookConfig.webpackFinal(dummyWebpackConfig);

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
