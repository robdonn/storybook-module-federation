import { withStorybookModuleFederation } from 'storybook-module-federation';

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

const moduleFederationWrapper = withStorybookModuleFederation({
  name: 'components',
  filename: '__remote/entry.js',
  exposes: {
    './Button': require.resolve('../src/components/Button/Button.jsx'),
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: false,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: false,
    },
  },
});

export default moduleFederationWrapper(config);
