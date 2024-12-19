const path = require('path');

module.exports = {
  name: 'module',
  entry: './src/index.ts',
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.mjs',
    module: true,
    library: {
      type: 'module',
    },
  },
  stats: 'errors-only',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      path: false,
    },
  },
  externals: { three: 'three' },
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: { inline: 'no-fallback' },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },

      { test: /\.(vs|fs|glsl|vert|frag)$/, loader: 'raw-loader' },
    ],
  },
  plugins: [],
};
