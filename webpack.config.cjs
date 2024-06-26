/* eslint-disable import/no-extraneous-dependencies */
// import path from 'path';
// import HtmlWebpackPlugin from 'html-webpack-plugin';

// Generated using webpack-cli https://github.com/webpack/webpack-cli

// import path from 'path';
// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// import HtmlWebpackPlugin from 'html-webpack-plugin';

// const isProduction = process.env.NODE_ENV === 'production';

// const config = {
//   entry: './src/index.js',
//   output: { path: path.resolve(__dirname, 'dist') },
//   devServer: {
//     open: true,
//     host: 'localhost',
//   },
//   plugins: [
//     new HtmlWebpackPlugin({ template: 'index.html' })

//     // Add your plugins here
//     // Learn more about plugins from https://webpack.js.org/configuration/plugins/
//   ],
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/i,
//         loader: 'babel-loader',
//       },
//       {
//         test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
//         type: 'asset',
//       },
//       { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
//       {
//         test: /\.scss$/,
//         use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
//       },
//       {
//         test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
//         use: 'url-loader?limit=10000',
//       },
//       {
//         test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
//         use: 'file-loader',
//       }
//       // Add your rules for custom modules here
//       // Learn more about loaders from https://webpack.js.org/loaders/
//     ],
//   },
// };

// module.exports = () => {
//   if (isProduction) {
//     config.mode = 'production';
//   } else {
//     config.mode = 'development';
//   }
//   return config;
// };
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, 'dist') },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html' })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] }
    ],
  },
};
