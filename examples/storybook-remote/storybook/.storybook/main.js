const {
  withStorybookModuleFederation,
} = require('storybook-module-federation');

module.exports = withStorybookModuleFederation({
  name: 'components',
  filename: '__remote/entry.js',
  exposes: {
    './Button': require.resolve('../src/components/Button/Button.jsx'),
  },
  shared: {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },
})({
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    builder: 'webpack5',
  },
});
