const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CircularDependencyPlugin = require('circular-dependency-plugin');
const baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
  devtool: 'sourcemap',
  plugins: [
    ...baseConfig.plugins,
    new BundleAnalyzerPlugin(),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    }),
  ],
});
