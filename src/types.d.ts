import { Configuration, container } from 'webpack';

const { ModuleFederationPlugin } = container;

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof ModuleFederationPlugin
>[0];

export interface WebpackConfig extends Configuration {
  entry: string[];
}

type WebpackFinal = (config: WebpackConfig) => WebpackConfig;

export interface StorybookConfigInput {
  core?: {
    builder?: string;
  };
  webpackFinal?: WebpackFinal;
}

export interface StorybookConfigOutput extends StorybookConfigInput {
  webpackFinal: WebpackFinal;
}
