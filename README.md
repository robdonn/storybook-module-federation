# storybook-module-federation

Make your Storybook components available as federated modules

## Requirements

Module Federation with Storybook requires using Webpack 5. Storybook added support for Webpack 5 in Storybook version 6.2. Please follow their guide to upgrading your Storybook application before using this package.

https://storybook.js.org/blog/storybook-for-webpack-5/

## Install

```sh
# yarn
yarn add -D storybook-module-federation

# npm
npm install -D storybook-module-federation
```

## Usage

```js
// .storybook/main.js

const {
  withStorybookModuleFederation,
} = require('storybook-module-federation');

const storybookConfig = {
  // Your storybook config
  // ...
};

const moduleFederationConfig = {
  name: 'components',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './components/Button.jsx',
  },
  shared: {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },
};

module.exports = withStorybookModuleFederation(moduleFederationConfig)(
  storybookConfig
);
```
