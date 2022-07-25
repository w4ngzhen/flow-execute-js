const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './src/simple/index.js',
  mode: "development",
  output: {
    path: path.resolve(__dirname, './dist-simple'),
    filename: 'simple.js'
  },
  devServer: {
    port: 8080
  },
  plugins: [new HtmlWebpackPlugin(
    {
      template: path.resolve(__dirname, './public/simple.html'),
      inject: "body"
    }
  )]
};
