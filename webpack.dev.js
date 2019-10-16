var path = require("path");

module.exports = {
  resolve: {
    extensions: [".ts", ".js"]
  },
  mode: "development",
  entry: {
    find: "./src/find.ts",
    book: "./src/book.ts",
    index: "./src/index.ts",
    worker: "./src/worker.ts",
    settings: "./src/settings.ts",
    favorites: "./src/favorites.ts"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }]
  },
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    watchContentBase: true,
    stats: {
      assets: false,
      hash: false,
      chunks: false,
      errors: true,
      errorDetails: true
    },
    overlay: true,
    proxy: [
      {
        context: ["/content", "config.json"],
        secure: false,
        changeOrigin: true,
        port: 8080
      }
    ]
  },
  devtool: "eval-source-map"
};
