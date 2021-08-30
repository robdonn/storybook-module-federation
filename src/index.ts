import VirtualModulesPlugin from 'webpack-virtual-modules';
import { container } from 'webpack';
import {
  StorybookConfigInput,
  StorybookConfigOutput,
  WebpackConfig,
  ModuleFederationPluginOptions,
} from './types';

const defaultConfig = (config: WebpackConfig) => config;

export const withStorybookModuleFederation =
  (moduleFederationConfig: ModuleFederationPluginOptions) =>
  (storybookConfig: StorybookConfigInput): StorybookConfigOutput => {
    const { webpackFinal = defaultConfig } = storybookConfig;

    if (storybookConfig?.core?.builder !== 'webpack5') {
      throw new Error(
        'Webpack 5 required: Configure Storybook to use the webpack5 builder'
      );
    }

    const { ModuleFederationPlugin } = container;

    const newStorybookConfig: StorybookConfigOutput = {
      ...storybookConfig,

      webpackFinal: (...args) => {
        const generatedWebpackConfig = webpackFinal(...args);
        const { entry } = generatedWebpackConfig;

        generatedWebpackConfig.entry = ['./__entry.js'];

        if (!generatedWebpackConfig.plugins) {
          generatedWebpackConfig.plugins = [];
        }

        generatedWebpackConfig.plugins.push(
          new ModuleFederationPlugin(moduleFederationConfig)
        );

        generatedWebpackConfig.plugins.push(
          new VirtualModulesPlugin({
            './__entry.js': entry
              .map((entryFile) => `import('${entryFile}');`)
              .join('\n'),
          })
        );

        return generatedWebpackConfig;
      },
    };

    return newStorybookConfig;
  };
