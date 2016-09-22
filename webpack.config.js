const env = require("./config/env")
const setup = require("./config/setup.json")
const webpack = require("webpack")
const webpackHelpers = require("./webpack/webpack.helpers")
const merge = require("webpack-merge")
const validate = require("webpack-validator")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const autoprefixer = require("autoprefixer")
const pkg = require("./package.json")

const PATHS = {
  build: path.join(__dirname, "dist"),
  hbs: [path.join(__dirname, "public")],
  public: "/",
  src: [path.join(__dirname, "src")],
  style: [path.join(__dirname, "public", "css", "style.scss")],
}

const vendorPackages = Object.keys(pkg.dependencies)

const common = merge(
  {
    cache: true,
    debug: true,
    entry: {
      app: PATHS.src,
      style: PATHS.style,
      vendor: vendorPackages,
    },
    output: {
      chunkFilename: "[hash].js",
      filename: "[name].[hash].js",
      path: PATHS.build,
      publicPath: PATHS.public,
    },
    externals: {},
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: env.NODE_ENV,
          BASE_URL: env.BASE_URL,
        },
      }),
      new HtmlWebpackPlugin(setup.html),
      new ExtractTextPlugin("style.[hash].css", {
        allChunks: true,
        disable: true, // CSS MODULES
      }),
    ],
    resolve: {
      root: PATHS.src,
      modulesDirectories: ["node_modules"],
      extensions: ["", ".js", ".json", ".ts"],
    },
    postcss: [
      autoprefixer({ browsers: ["last 2 versions"] }),
    ],
    sassResources: [
      path.join(__dirname, "public/css/_mixins.scss"),
      path.join(__dirname, "public/css/_variables.scss"),
      path.join(__dirname, "public/css/_resets.scss"),
    ],
  },
  // webpackHelpers.loadFiles(PATHS.files),
  // webpackHelpers.loadFonts(PATHS.fonts),
  webpackHelpers.loadHBS(PATHS.hbs),
  webpackHelpers.loadJSON(PATHS.src),
  webpackHelpers.loadSASS(PATHS.sass),
  // webpackHelpers.loadSASS(PATHS.sass_modules, { module: true, resources: true }),
  webpackHelpers.loadTypeScript(PATHS.src)
)

let config
// Detect how npm is run and branch based on that
switch (process.env.npm_lifecycle_event) {
case "build":
  config = merge(
    common,
    webpackHelpers.clean(PATHS.build),
    webpackHelpers.extractBundle({
      name: "vendor",
      entries: vendorPackages,
    }),
    webpackHelpers.extractCSS(PATHS.style),
    webpackHelpers.purifyCSS(PATHS.app),
    webpackHelpers.minify(),
    webpackHelpers.setFreeVariable(
      "process.env.NODE_ENV",
      "production"
    )
  )
  break
default:
  config = merge(
    {
      devtool: "eval-source-map",
    },
    common,
    webpackHelpers.devServer({
      host: process.env.HOST,
      port: process.env.PORT,
    }),
    webpackHelpers.loadCSS(PATHS.style)
  )
}

module.exports = config // validate(config) // breaks w/ sassResources