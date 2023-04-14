import VirtualModulesPlugin from 'webpack-virtual-modules';
import HtmlWebpackPlugin from 'html-webpack-plugin';
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

export type WithStorybookModuleFederation = (
  moduleFederationConfig: ModuleFederationPluginOptions,
  options: Options
) => (storybookConfig: StorybookConfigInput) => StorybookConfigOutput;

export const withStorybookModuleFederation: WithStorybookModuleFederation =
  (moduleFederationConfig, options = {}) =>
  (storybookConfig) => {
    const { name = 'mfComponents' } = moduleFederationConfig;

    if (!moduleFederationConfig.name) {
      moduleFederationConfig.name = name;
    }

    const { webpackFinal = defaultConfig } = storybookConfig;

    const newStorybookConfig: StorybookConfigOutput = {
      ...storybookConfig,

      webpackFinal: async (...args) => {
        const generatedWebpackConfig = await webpackFinal(...args);
        const { entry, context } = generatedWebpackConfig;

        generatedWebpackConfig.entry = {
          main: ['./__entry.js'],
          [name]: ['./__internal_remoteEntry.js'],
        };

        if (!generatedWebpackConfig.plugins) {
          generatedWebpackConfig.plugins = [];
        }

        const htmlPlugin = generatedWebpackConfig.plugins.find(
          (plugin) => plugin instanceof HtmlWebpackPlugin
        );

        if (htmlPlugin) {
          (
            htmlPlugin as unknown as {
              userOptions: { excludeChunks?: string[] };
            }
          ).userOptions.excludeChunks = [name];
        }

        generatedWebpackConfig.plugins.unshift(
          new VirtualModulesPlugin({
            './__entry.js': `import('./__bootstrap.js');`,
            './__bootstrap.js': (Array.isArray(entry)
              ? entry
              : Object.values(entry).flat()
            )
              .map(
                (entryFile) =>
                  `import '${correctImportPath(
                    context || process.cwd(),
                    entryFile
                  )}';`
              )
              .join('\n'),
            './__internal_remoteEntry.js': `__webpack_public_path__ = new URL(document.currentScript.src).origin + "/";
            Object.assign(window, {
              ${name}: __webpack_require__("webpack/container/entry/${name}"),
            });`,
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

export { ModuleFederationPluginOptions, Options } from './plugin';
