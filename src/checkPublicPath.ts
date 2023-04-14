import { Options, WebpackConfig } from './plugin';

export const checkPublicPath = (config: WebpackConfig, options: Options) => {
  if (!config.output) {
    return;
  }

  if (
    typeof config.output?.publicPath !== 'string' ||
    config.output?.publicPath === 'auto'
  ) {
    config.output.publicPath = '';
    return;
  }
};
