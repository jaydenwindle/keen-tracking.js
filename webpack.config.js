const path = require('path');
const webpack = require('webpack');

const fileName = 'keen-tracking';
let entry, alias;

// const entry = ( process.env.TARGET !== 'node' ) ? [ './lib/browser.js'] : './lib/server.js' ;
// const alias = ( process.env.TARGET !== 'node' ) ? [] : {'./cache-browser' : './cache-node'};

switch (process.env.TARGET) {
  case "node":
    entry = './lib/server.js';
    alias = {'./cache-browser' : './cache-node'};
    break;

  case "react-native":
    entry = './lib/react-native.js';
    alias = {'./cache-browser' : './cache-node'};
    process.env.TARGET = "web"; // reset to web
    break;

  default: // browser
    entry = [ './lib/browser.js' ];
    alias = [];
    break;
}

let definePluginVars = {};
if (process.env.NODE_ENV === 'development') {
  const demoConfig = require('../demo-config');
  definePluginVars = {
    webpackKeenGlobals: JSON.stringify({ demoConfig })
  };
}

module.exports = {
  entry,

  target: process.env.TARGET ? `${process.env.TARGET}` : 'web',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${
      process.env.TARGET ? `${process.env.TARGET}/` : ''
    }${
      fileName
    }${
      process.env.OPTIMIZE_MINIMIZE ? '.min' : ''
    }.js`,
    library: `${!process.env.LIBRARY ? '' : process.env.LIBRARY}`,
    libraryTarget: 'umd',
  },

  module: {

    rules: [
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, 'lib'),
        ],
        exclude: [
          path.resolve(__dirname, 'node_modules'),
        ],
        loader: 'babel-loader',
      },

      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],

  },

  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
    alias
  },

  optimization: {
    minimize: !!process.env.OPTIMIZE_MINIMIZE,
  },

  devtool: 'source-map',

  context: __dirname,

  // stats: 'verbose',

  plugins: [
    new webpack.DefinePlugin(definePluginVars)
  ],

  mode: process.env.NODE_ENV,

  devServer: {
    contentBase: path.join(__dirname, 'test/demo'),
    open: true,
    inline: true,
    hot: false,
    watchContentBase: true,
  },

  externals: process.env.TARGET === 'node' ? {
    'component-emitter' : 'component-emitter',
    'js-cookie' : 'js-cookie',
    'keen-core' : 'keen-core',
    'whatwg-fetch': 'whatwg-fetch',
    'promise-polyfill': 'promise-polyfill'
  } : {
  },

};
