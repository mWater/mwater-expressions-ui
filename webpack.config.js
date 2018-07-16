path = require('path');

module.exports = {
  entry: ['./src/demo.coffee'],
  devtool: "source-map",
  output: {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'dist', 'js'),
    publicPath: 'http://localhost:3001/js/'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: ["coffee-loader"] },
    ]
  },
  resolve: {
    extensions: [".coffee", ".js", ".json", ".hbs"]
  },
  externals: {
    jquery: "$",
    lodash: '_',
    underscore: '_'
  }
};