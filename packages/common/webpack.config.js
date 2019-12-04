
module.exports = {
  mode: "development",
  // devtool: "inline-source-map",
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    library: ["Tweakpad", "Common"],
    libraryTarget: "umd"
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