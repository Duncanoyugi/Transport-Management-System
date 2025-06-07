const path = require('path');

module.exports = {
  entry: './src/app.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'TransportManagementSystem',
    libraryTarget: 'umd',
  },
};