const { withStorybookModuleFederation } = require('../../../..');

module.exports = withStorybookModuleFederation({
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
})({
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    builder: 'webpack5',
  },
});
