const path = require("path");

module.exports = {
  mode: "development",
  // devtool: "inline-source-map",
  entry: {
    common: [
      "./src/index.ts"
    ],
  },
  output: {
    filename: "[name].bundle.js",
    library: ["Tweakpad", "Common"],
    libraryTarget: "umd",
    path: path.resolve(__dirname, './dist'),
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
};