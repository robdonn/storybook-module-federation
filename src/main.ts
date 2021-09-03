import VirtualModulesPlugin from 'webpack-virtual-modules';
import {
  ModuleFederationPlugin,
  StorybookConfigInput,
  StorybookConfigOutput,
  WebpackConfig,
  ModuleFederationPluginOptions,
} from './plugin';

const defaultConfig = (config: WebpackConfig) => config;

export const checkPublicPath = (config: WebpackConfig) => {
  if (!config.output) {
    return;
  }

  if (
    typeof config.output?.publicPath === 'string' &&
    config.output?.publicPath === ''
  ) {
    delete config.output.publicPath;
    return;
  }

  if (!config.output?.publicPath) {
    return;
  }

  if (typeof config.output.publicPath === 'string') {
    if (
      config.output.publicPath.startsWith('./') ||
      (config.output.publicPath.startsWith('/') &&
        !config.output.publicPath.startsWith('//'))
    ) {
      console.warn(`Using a relative or root publicPath may cause issues with loading federated modules.
It is advised to use the full host name if known, or set to "undefined" and allow Webpack to determine it for you.`);
    }
  }
};

export const withStorybookModuleFederation =
  (moduleFederationConfig: ModuleFederationPluginOptions) =>
  (storybookConfig: StorybookConfigInput): StorybookConfigOutput => {
    const { webpackFinal = defaultConfig } = storybookConfig;

    if (storybookConfig?.core?.builder !== 'webpack5') {
      throw new Error(
        'Webpack 5 required: Configure Storybook to use the webpack5 builder'
      );
    }

    const newStorybookConfig: StorybookConfigOutput = {
      ...storybookConfig,

      webpackFinal: (...args) => {
        const generatedWebpackConfig = webpackFinal(...args);
        const { entry } = generatedWebpackConfig;

        generatedWebpackConfig.entry = ['./__entry.js'];

        if (!generatedWebpackConfig.plugins) {
          generatedWebpackConfig.plugins = [];
        }

        generatedWebpackConfig.plugins.unshift(
          new VirtualModulesPlugin({
            './__entry.js': `import('./__bootstrap.js');`,
            './__bootstrap.js': entry
              .map((entryFile) => `import '${entryFile}';`)
              .join('\n'),
          })
        );

        generatedWebpackConfig.plugins.push(
          new ModuleFederationPlugin(moduleFederationConfig)
        );

        if (generatedWebpackConfig?.optimization?.runtimeChunk) {
          generatedWebpackConfig.optimization.runtimeChunk = false;
        }

        checkPublicPath(generatedWebpackConfig);

        return generatedWebpackConfig;
      },
    };

    return newStorybookConfig;
  };
