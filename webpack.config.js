'use strict'

const autoprefixer = require('autoprefixer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(process.cwd(), 'examples-dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.(js|jsx)$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.styl$/, loader: 'style-loader!css-loader!postcss-loader!stylus-loader', exclude: /node_modules/ }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src/index.html' }
    ])
  ],
  devServer: {
    host: '0.0.0.0',
    port: 6060,
    inline: true,
    historyApiFallback: true,
    open: true
  }
}

module.exports = config
