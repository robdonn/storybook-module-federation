const { withStorybookModuleFederation } = require('../../../..');

module.exports = withStorybookModuleFederation({
  name: 'components',
  remotes: {
    reactApp: 'reactApp@//localhost:8000/__remote/entry.js',
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
