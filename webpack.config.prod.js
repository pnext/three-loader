const CircularDependencyPlugin = require('circular-dependency-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');

const umdConfig = require('./webpack.config');
const esmConfig = require('./webpack.esm.config');

module.exports = [
  Object.assign(umdConfig, {
    stats: 'normal',
    plugins: [
      ...umdConfig.plugins,
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(true),
      }),
      new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: true,
        cwd: process.cwd(),
      }),
      new BundleAnalyzerPlugin(),
    ],
  }),
  Object.assign(esmConfig, {
    stats: 'normal',
    plugins: [
      ...esmConfig.plugins,
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(true),
      }),
      new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: true,
        cwd: process.cwd(),
      }),
    ],
  }),
];
