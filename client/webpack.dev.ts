import fs from 'fs'
import path from 'path'
import { merge } from 'webpack-merge'
import webpack from 'webpack'
import commonConfig from './webpack.common'
import { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';

const DEV_PORT = 3000

/** Linked workspace package output; must be watched so client rebuilds when ui-kit watch rebuilds. */
const uiKitDistGlob = path
  .join(path.resolve(__dirname, '..', 'ui-kit', 'dist'), '**', '*')
  .replace(/\\/g, '/')

function devServerOpen(): DevServerConfiguration['open'] {
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    const canary = path.join(
      process.env.LOCALAPPDATA,
      'Google',
      'Chrome SxS',
      'Application',
      'chrome.exe'
    )
    if (fs.existsSync(canary)) {
      return {
        target: `http://localhost:${DEV_PORT}/`,
        app: { name: canary, arguments: [] },
      }
    }
  }
  if (process.platform === 'darwin') {
    const canary =
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
    if (fs.existsSync(canary)) {
      return {
        target: `http://localhost:${DEV_PORT}/`,
        app: { name: canary, arguments: [] },
      }
    }
  }
  return true
}

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
      paths: ['src/**/*', uiKitDistGlob],
      options: {
        usePolling: true, // Docker bind mounts and some Windows setups
        interval: 500,
      },
    },
    port: DEV_PORT,
    open: devServerOpen(),
    historyApiFallback: true,
  }
});

export default devConfig
