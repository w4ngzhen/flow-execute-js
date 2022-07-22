// webpack.config.js
const {resolve} = require("path");
module.exports = {
  // 组件库的起点入口
  entry: './src/index.ts',
  output: {
    filename: "flow-execute-core.js", // 打包后的文件名
    path: resolve(__dirname, 'dist'), // 打包后的文件目录：根目录/dist/
    libraryTarget: 'umd',
  },
  resolve: {
    // webpack 默认只处理js、jsx等js代码
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  // 模块
  module: {
    // 规则
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: []
};
