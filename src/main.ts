import path from 'path';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { checkPublicPath } from './checkPublickPath';
import {
  ModuleFederationPlugin,
  StorybookConfigInput,
  StorybookConfigOutput,
  ModuleFederationPluginOptions,
  Options,
  WebpackFinal,
} from './plugin';

const defaultConfig: WebpackFinal = (config) => config;

const correctImportPath = (context: string, entryFile: string) => {
  const relative = path.relative(context, entryFile).replace(/\\/g, '/');

  if (relative.includes('node_modules/')) {
    return relative.split('node_modules/')[1];
  }

  return `./${relative}`;
};

export const withStorybookModuleFederation =
  (
    moduleFederationConfig: ModuleFederationPluginOptions,
    options: Options = {}
  ) =>
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
