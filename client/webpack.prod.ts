import { merge } from 'webpack-merge'
import common from './webpack.common'
import TerserPlugin from 'terser-webpack-plugin'
import path from "path";

export default merge(common, {
  mode: 'production',
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    filename: "[name].[contenthash].js"
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
