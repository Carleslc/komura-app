// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const CopyWebpackPlugin = require('copy-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = function config(ctx) {
  return {
    // app boot file (/src/boot)
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: ['sentry', 'i18n', 'firebase', 'auth', 'axios'],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: ['app.scss', 'utils.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'material-icons-outlined',
      'material-icons-round'
      // 'eva-icons',
      // 'mdi-v4',
      // 'ionicons-v4',
      // 'fontawesome-v5',
      // 'line-awesome',
      // 'themify',

      // 'roboto-font'
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: 'material-icons-outlined', // Quasar icon set
      lang: 'es', // Quasar language pack

      // Possible values for "all":
      // * 'auto' - Auto-import needed Quasar components & directives
      //            (slightly higher compile time; next to minimum bundle size; most convenient)
      // * false  - Manually specify what to import
      //            (fastest compile time; minimum bundle size; most tedious)
      // * true   - Import everything from Quasar
      //            (not treeshaking Quasar; biggest bundle size; convenient)
      all: 'auto',

      components: [],
      directives: [],

      // Quasar plugins
      plugins: ['LocalStorage', 'Meta', 'Notify'],

      config: {
        dark: false // [true, false, auto] avoid in SSR (modify in-app instead)
      }
    },

    // https://quasar.dev/quasar-cli/cli-documentation/supporting-ie
    supportIE: false,

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-htmlVariables
    htmlVariables: {},

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      modern: true,
      scopeHoisting: true,
      vueRouterMode: 'history', // available values: 'hash', 'history'
      showProgress: true,
      gzip: true,
      analyze: false, // webpack-bundle-analyzer
      // Options below are automatically set depending on the env, set them if you want to override
      preloadChunks: true,
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      chainWebpack(chain) {
        chain.module
          .rule('vue')
          .use('vue-loader')
          .loader('vue-loader')
          .tap(options => {
            options.transpileOptions = {
              transforms: {
                dangerousTaggedTemplateString: true
              }
            };
            return options;
          });
      },

      extendWebpack(cfg) {
        cfg.module.rules.push(
          {
            enforce: 'pre',
            test: /\.(js|vue)$/,
            exclude: /node_modules/,
            loader: 'eslint-loader',
            options: {
              formatter: require('eslint').CLIEngine.getFormatter('stylish')
            }
          },
          {
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader'
          }
        );
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          '@': require('path').resolve(__dirname, 'src')
        };

        if (ctx.prod) {
          cfg.plugins.push(new CopyWebpackPlugin([{ from: './_redirects', to: '' }]));
          cfg.plugins.push(new SentryWebpackPlugin({ include: 'src' }));
        }
      },

      uglifyOptions: {
        drop_debugger: ctx.prod,
        drop_console: ctx.prod
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 8080,
      open: true, // opens browser window automatically
      historyApiFallback: {
        disableDotRule: true
      }
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW
      manifest: {
        name: 'Komura',
        short_name: 'Komura',
        description: 'Kindly Network',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#015afe',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
      id: 'app.komura'
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'komura'
      },

      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,

      extendWebpack(cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      }
    }
  };
};
