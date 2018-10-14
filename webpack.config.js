const webpack = require("webpack");
const path = require("path");
const pkg = require('./package.json');

const timeStamp = new Date().toLocaleTimeString();
const date = new Date();
const banner = `
${pkg.name} v${pkg.version}       ${date}
by ${pkg.author.name}    ${pkg.author.email}
${pkg.homepage}

Copyright: 2018 NTNU
License: ${pkg.license}

Build: [hash]
`;


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
    },
    plugins: [
        new webpack.BannerPlugin({banner: banner}),
    ]
};