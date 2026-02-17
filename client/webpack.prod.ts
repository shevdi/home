import path from "path";
import { merge } from 'webpack-merge'
import CopyPlugin from 'copy-webpack-plugin';
import common from './webpack.common'
import TerserPlugin from 'terser-webpack-plugin'

export default merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: path.resolve(__dirname, 'public'),
        to: '.',
        noErrorOnMissing: true,
        globOptions: { ignore: ['**/index.html'] },
      }],
    }),
  ],
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
