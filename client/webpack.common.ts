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
      NODE_ENV: 'development',
      BACKEND_URL: process.env.BACKEND_URL || 'https://home-server-shevdi.amvera.io/api/v1'
      // BACKEND_URL: 'http://localhost:3001/api/v1'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
      filename: 'index.html',
      inject: 'body'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
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
