/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ESLintPlugin = require("eslint-webpack-plugin");

const { NODE_ENV = "production" } = process.env;
module.exports = {
  mode: NODE_ENV,
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [new ESLintPlugin({})],
  target: "node",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  externals: [nodeExternals()],
  watch: NODE_ENV === "development",
};
