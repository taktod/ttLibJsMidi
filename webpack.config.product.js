module.exports = {
  entry: __dirname + "/src/ts/ttLibJsMidi.ts",
  output: {
    path: __dirname + "/",
    filename: "ttLibJsMidi.js",
    library: ["ttm"]
  },
  resolve: {
    extensions: ["", ".ts"]
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: "awesome-typescript-loader"}
    ]
  }
}