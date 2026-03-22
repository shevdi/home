import path from 'path'
import { merge } from 'webpack-merge'
import webpack from 'webpack'
import commonConfig from './webpack.common'
import { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';

interface CustomConfiguration extends Configuration {
  devServer?: DevServerConfiguration;
}

const devConfig: CustomConfiguration = merge(commonConfig, {
  mode: 'development',
  plugins: [
    new webpack.EnvironmentPlugin({
      YANDEX_METRIKA_ID: '',
    }),
  ],
  output: {
    filename: "[name].js",
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    hot: 'only',
    liveReload: false,
    host: '0.0.0.0',  // Important for Docker
    devMiddleware: {
      writeToDisk: false,
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
