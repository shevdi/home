import path from "path";
import { merge } from 'webpack-merge'
import webpack from 'webpack'
import CopyPlugin from 'copy-webpack-plugin';
import { GenerateSW } from 'workbox-webpack-plugin'
import common from './webpack.common'
import TerserPlugin from 'terser-webpack-plugin'

/**
 * GenerateSW must run once per full production build. Under `webpack serve` or `--watch`,
 * each rebuild re-runs the plugin and the precache manifest can be wrong (workbox#1790).
 * Skip in those modes; use `npm run build` for an accurate service worker.
 * @see https://github.com/GoogleChrome/workbox/issues/1790
 */
const isOneShotProductionBuild =
  process.env.WEBPACK_SERVE !== 'true' && process.env.WEBPACK_WATCH !== 'true'

export default merge(common, {
  mode: 'production',
  plugins: [
    new webpack.EnvironmentPlugin({
      YANDEX_METRIKA_ID: process.env.YANDEX_METRIKA_ID ?? '',
      TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME ?? '',
      BACKEND_URL: process.env.BACKEND_URL ?? 'https://home-server-shevdi.amvera.io/api/v1',
    }),
    new CopyPlugin({
      patterns: [{
        from: path.resolve(__dirname, 'public'),
        to: '.',
        noErrorOnMissing: true,
        globOptions: { ignore: ['**/index.html'] },
      }],
    }),
    ...(isOneShotProductionBuild
      ? [
        // Precache: Workbox-managed revisioned cache for webpack-emitted assets.
        // Photos: separate runtime cache `pwa-photo-runtime-v1` (expiration: 200 entries, 30d) — see runtimeCaching.
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ request }: { request: Request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'pwa-photo-runtime-v1',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        }),
      ]
      : []),
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
  // Initial graph still pulls one large vendor chunk (~React/Redux/router/ui-kit); lazy routes split page code into async chunks.
  performance: {
    hints: 'warning',
    maxEntrypointSize: 1200000,
    maxAssetSize: 1200000,
  },
});
