import { Options, WebpackConfig } from './plugin';

export const checkPublicPath = (config: WebpackConfig, options: Options) => {
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

      if (!options.ignorePublicPath) {
        process.exit(1);
      }
    }
  }
};
