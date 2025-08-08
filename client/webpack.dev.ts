import { merge } from 'webpack-merge'
import commonConfig from './webpack.common'
import { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';

interface CustomConfiguration extends Configuration {
  devServer?: DevServerConfiguration;
}

const devConfig: CustomConfiguration = merge(commonConfig, {
  mode: 'development',
  output: {
    filename: "[name].[contenthash].js",
  },
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    host: '0.0.0.0',  // Important for Docker
    devMiddleware: {
      writeToDisk: true,  // Optional: write files to disk for better debugging
    },
    watchFiles: {
      paths: ['src/**/*'],  // Watch these files for changes
      options: {
        usePolling: true,  // Required for Docker
        interval: 500,
      },
    },
    port: 3000,
    open: true,
    historyApiFallback: true,
  }
});

export default devConfig
