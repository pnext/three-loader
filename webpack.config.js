const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    library: 'potree',
    libraryTarget: 'amd',
    umdNamedDefine: true,
  },
  devtool: 'source-map',
  stats: 'errors-only',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  externals: ['three'],
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: { inline: 'no-fallback', esModule: false },
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
