// @ts-ignore
import CracoAntDesignPlugin from 'craco-antd'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { CracoConfig, addAfterLoader, loaderByName } from '@craco/craco'
// @ts-ignore
import rehypePrism from '@mapbox/rehype-prism'
// @ts-ignore
// import { codeImport } from 'remark-code-import'

const config: CracoConfig = {
  webpack: {
    configure: webpackConfig => {
      webpackConfig.resolve!.plugins = [
        ...(webpackConfig.resolve!.plugins ?? []),
        new TsconfigPathsPlugin({
          /* options: see below */
        }),
      ]
      const x = addAfterLoader(webpackConfig, loaderByName('babel-loader'), {
        test: /\.mdx?$/,
        use: [
          {
            loader: '@mdx-js/loader',
            /** @type {import('@mdx-js/loader').Options} */
            options: {
              providerImportSource: '@mdx-js/react',
              remarkPlugins: [
                // [hins],
                // [codesandbox, { mode: 'button' }],
                // [codeImport],
              ],
              rehypePlugins: [
                [rehypePrism, { throwOnError: true, strict: true }],
              ],
            },
          },
        ],
      })
      return webpackConfig
    },
  },
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          '@primary-color': '#3e82f7',
          '@link-color': '#3e82f7',
        },
      },
    },
  ],
}

export default config
