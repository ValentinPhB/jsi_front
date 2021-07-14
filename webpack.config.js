const path = require('path');
 
 
module.exports = {
 mode: "production",
 entry: {
     polyfill: "babel-polyfill",
     app: "./javascript/index.js"
 },
 output: {
   path: path.resolve(__dirname, "dist"),
   filename: "[name].bundle.js"
 },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};
