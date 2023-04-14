import { Configuration, container } from 'webpack';

export const { ModuleFederationPlugin } = container;

export type Thing = typeof ModuleFederationPlugin;

export declare type ModuleFederationPluginOptions = ConstructorParameters<
  typeof ModuleFederationPlugin
>[0];

export declare interface WebpackConfig extends Configuration {
  entry: string[] | Record<string, string[]>;
}

export declare type WebpackFinal = (
  config: WebpackConfig
) => Promise<WebpackConfig> | WebpackConfig;

export declare interface StorybookConfigInput {
  core?: {
    builder?: string;
  };
  webpackFinal?: WebpackFinal;
}

export declare interface StorybookConfigOutput extends StorybookConfigInput {
  webpackFinal: WebpackFinal;
}

export declare interface Options {}
