import VirtualModulesPlugin from 'webpack-virtual-modules';
import { container } from 'webpack';
import { checkPublicPath } from './checkPublicPath';
import { correctImportPath } from './correctImportPath';
import {
  ModuleFederationPlugin,
  StorybookConfigInput,
  StorybookConfigOutput,
  ModuleFederationPluginOptions,
  Options,
  WebpackFinal,
} from './plugin';

const defaultConfig: WebpackFinal = (config) => config;

/* istanbul ignore next */
if (!container.ModuleFederationPlugin) {
  throw new Error('Webpack 5 required');
}

export const withStorybookModuleFederation =
  (
    moduleFederationConfig: ModuleFederationPluginOptions,
    options: Options = {}
  ) =>
  (storybookConfig: StorybookConfigInput): StorybookConfigOutput => {
    const { webpackFinal = defaultConfig } = storybookConfig;

    const newStorybookConfig: StorybookConfigOutput = {
      ...storybookConfig,

      webpackFinal: async (...args) => {
        const generatedWebpackConfig = await webpackFinal(...args);
        const { entry, context } = generatedWebpackConfig;

        generatedWebpackConfig.entry = ['./__entry.js'];

        if (!generatedWebpackConfig.plugins) {
          generatedWebpackConfig.plugins = [];
        }

        generatedWebpackConfig.plugins.unshift(
          new VirtualModulesPlugin({
            './__entry.js': `import('./__bootstrap.js');`,
            './__bootstrap.js': entry
              .map(
                (entryFile) =>
                  `import '${correctImportPath(
                    context || process.cwd(),
                    entryFile
                  )}';`
              )
              .join('\n'),
          })
        );

        generatedWebpackConfig.plugins.push(
          new ModuleFederationPlugin(moduleFederationConfig)
        );

        if (generatedWebpackConfig?.optimization?.runtimeChunk) {
          generatedWebpackConfig.optimization.runtimeChunk = false;
        }

        checkPublicPath(generatedWebpackConfig, options);

        return generatedWebpackConfig;
      },
    };

    return newStorybookConfig;
  };
