import { Configuration, container } from 'webpack';

const { ModuleFederationPlugin } = container;

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof ModuleFederationPlugin
>[0];

export interface WebpackConfig extends Configuration {
  entry: string[];
}

export interface StorybookConfig {
  core?: {
    builder?: string;
  };
  webpackFinal?: (config: WebpackConfig) => WebpackConfig;
}
