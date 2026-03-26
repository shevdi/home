import path from "path";
import webpack, { Configuration } from 'webpack'
import HtmlWebpackPlugin from "html-webpack-plugin";

const commonConfig: Configuration = {
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    filename: "[name].[contenthash].js",
    publicPath: '/',
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      // Default matches Docker Compose / local API; override at build time for prod images or CI.
      BACKEND_URL: 'http://localhost:3001/api/v1',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
      filename: 'index.html',
      inject: 'body',
      favicon: path.resolve(__dirname, "src", "assets", "favicon.ico"),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.(jpg|jpeg|png|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  },
}

export default commonConfig
