const webpack = require("webpack")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const PurifyCSSPlugin = require("purifycss-webpack-plugin")

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd(),
      }),
    ],
  }
}

exports.devServer = function(options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated loads.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn"t set
      // HotModuleReplacementPlugin!
      hot: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: "errors-only",

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || "0.0.0.0"
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port, // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        multiStep: true,
      }),
    ],
  }
}

exports.extractBundle = function(options) {
  const entry = {}
  entry[options.name] = options.entries

  return {
    entry: entry, // Define an entry point needed for splitting.
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, "manifest"],
      }),
    ],
  }
}

exports.extractCSS = function(paths) {
  return {
    module: {
      loaders: [{
        include: paths,
        loader: ExtractTextPlugin.extract("style", "css"),
        test: /\.css$/,
      }],
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin("[name].[chunkhash].css"),
    ],
  }
}

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        beautify: false, // Don"t beautify output (enable for neater output)
        comments: false, // Eliminate comments
        compress: { // Compression specific options
          drop_console: true, // Drop `console` statements
          warnings: false,
        },
        mangle: { // Mangling specific options
          except: ["$"], // Don"t mangle $
          keep_fnames: true, // Don"t mangle function names
          screw_ie8: true, // Don"t care about IE8
        },
      }),
    ],
  }
}

exports.purifyCSS = function(paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        paths: paths,
      }),
    ],
  }
}

exports.setFreeVariable = function(key, value) {
  const env = {}
  env[key] = JSON.stringify(value)
  return {
    plugins: [
      new webpack.DefinePlugin(env),
    ],
  }
}

exports.loadCSS = function(paths) {
  return {
    module: {
      loaders: [{
        include: paths,
        loaders: ["style", "css"],
        test: /\.css$/,
      }],
    },
  }
}

exports.loadHBS = function(paths) {
  return {
    module: {
      loaders: [{
        exclude: /node_modules/,
        include: paths,
        loader: "handlebars",
        test: /\.hbs$/,
      }],
    },
  }
}

exports.loadFiles = function(paths) {
  return {
    module: {
      loaders: [{
        exclude: /node_modules/,
        include: paths,
        loader: "file",
        test: /\.(gif|png|jpg|mp3|mp4)$/,
        query: {
        },
      }],
    },
  }
}

exports.loadFonts = function(paths, location="public/fonts/") {
  return {
    module: {
      loaders: [{
        exclude: /node_modules/,
        include: paths,
        loader: "file",
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        query: {
          name: location + "[name].[ext]",
        },
      }],
    },
  }
}

exports.loadJSON = function(paths) {
  return {
    module: {
      loaders: [{
        exclude: /node_modules/,
        include: paths,
        loader: "json",
        test: /\.json$/,
      }],
    },
  }
}

exports.loadSASS = function(paths, opts={}) { // opts include=FALSE||"PATH", module=FALSE||FALSE
  return {
    module: {
      loaders: [{
        include: paths,
        loader: ExtractTextPlugin.extract(
          "style",
          "css" + (opts.module ? "?modules&importLoaders=1&localIdentName=[folder]_[name]_[local]_[hash:base64:5]" : "") + "!" +
          "postcss!" +
          "sass?outputStyle=expanded" + (opts.include ? ("&includePaths[]=" + opts.include) : "") + "!" +
          (opts.resources ? "sass-resources" : "")
        ),
        test: /\.scss$/,
      }],
    },
  }
}

exports.loadTypeScript = function(paths) {
  return {
    module: {
      loaders: [{
        exclude: /node_modules/,
        include: paths,
        loader: "ts",
        test: /\.tsx?$/, 
      }],
    },
  }
}