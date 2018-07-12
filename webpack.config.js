const path = require("path");

module.exports = {
    mode: 'production',
    entry: "./src/tex2max.js",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "tex2max.js",
        library: "tex2max",
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["babel-preset-env"]
                    }
                }
            }
        ]
    }
};