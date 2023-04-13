const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const { ModuleFederationPlugin } = webpack.container;

module.exports = {
  entry: './src/entry.js',
  mode: 'development',
  devServer: {
    hot: true,
    port: 8000,
    // open: true,
  },
  resolve: {
    extensions: ['.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ModuleFederationPlugin({
      name: 'reactApp',
      remotes: {
        components: 'components@//localhost:9000/__remote/entry.js',
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
    }),
  ],
};
