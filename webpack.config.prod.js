const CircularDependencyPlugin = require('circular-dependency-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
  devtool: false,
  stats: 'normal',
  plugins: [
    ...baseConfig.plugins,
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(true),
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static' })
  ],
});
