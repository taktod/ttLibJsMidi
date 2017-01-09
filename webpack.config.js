var webpack = require("webpack");
var CopyPlugin = require("copy-webpack-plugin");
var BrowserSyncPlugin = require("browser-sync-webpack-plugin");
module.exports = {
  entry: __dirname + "/src/ts/app.ts",
  output: {
    path: __dirname + "/dest/js",
    filename: "app.js"
  },
  devtool: "#inline-source-map",
  resolve: {
    extensions: ["", ".ts"]
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: "awesome-typescript-loader"}
    ]
  },
  plugins: [
    new CopyPlugin([
      {context:__dirname + "/src", from: "*", to:__dirname + "/dest"},
      {context:__dirname + "/src/soundfont", from:"**/*", to:__dirname + "/dest/soundfont"}
    ]),
    new BrowserSyncPlugin({
      host: "localhost",
      port: 3000,
      server: {baseDir: __dirname + "/dest/"}
    })
  ]
}