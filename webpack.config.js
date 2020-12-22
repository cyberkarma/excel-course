const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

const filename = (ext) => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`;

const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  ];
  if (isDev) {
    loaders.push('eslint-loader');
  }
  return loaders;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: './index.js',
  output: {

    // Это название файла на выходе, в котором будут все наши исходники
    filename: filename('js'),

    // Это название директории, в которой будут исходники
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
    },
  },

  devtool: isDev ? 'source-map' : false,

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000,
    hot: true,
    open: true,
    watchContentBase: true,
    progress: true,
    proxy: {
      '/api': 'http://localhost:8080',
      'changeOrigin': true,
      'autoRewrite': true,
    },
  },

  plugins: [

    // Плагин, который чистит папку дист, чтобы файлов с хэшем не было
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: 'index.html',
      minify: {
        removeComments: isProd,
        collapseWhiteSpace: isProd,
      },
    }),

    // Плагин, который копирует файлы из сорса в билд, в нашем случае иконки
    new CopyPlugin({
      patterns:
                [
                  {
                    from: path.resolve(__dirname, 'src/favicon.ico'),
                    to: path.resolve(__dirname, 'dist'),
                  },
                ],
    }),

    // Плагин, который минифицирует Css
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          options: {
            hmr: isDev,
            reloadAll: true,
          },
        },
        // Translates CSS into CommonJS
        'css-loader',
        // Compiles Sass to CSS
        'sass-loader',
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
    ],
  },
};
