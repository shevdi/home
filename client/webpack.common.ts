import path from "path";
import webpack, { Configuration } from 'webpack'
import HtmlWebpackPlugin from "html-webpack-plugin";

const commonConfig: Configuration = {
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    filename: "[name].[contenthash].js",
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // default value
      BACKEND_URL: 'http://localhost:3001/api/v1'
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
      }
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
}

export default commonConfig
