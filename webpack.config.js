const webpack = require("webpack");
const createVariants = require('parallel-webpack').createVariants;
const path = require("path");
const pkg = require('./package.json');
const mode = 'production';

const timeStamp = new Date().toLocaleTimeString();
const date = new Date();
const banner = `
${pkg.name} v${pkg.version}       ${date}
by ${pkg.author.name}    ${pkg.author.email}
${pkg.homepage}

Copyright: 2019 NTNU
License: ${pkg.license}

Build: [hash]
`;

let umdConfig = {
    mode: mode,
    entry: "./build/merge.js",
    output: {
        path: path.resolve(__dirname, "lib"),
        filename: "tex2max.js",
        library: "tex2max",
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({banner: banner}),
    ]
};

function getFileExtension(libraryTarget) {
    let fileExtention = "";
    switch (libraryTarget) {
        case "commonjs2":
            fileExtention = "common";
            break;
        default :
            fileExtention = libraryTarget;
            break;
    }
    return fileExtention;
}

function createConfig(options) {
    let plugins = [
        new webpack.BannerPlugin({banner: banner}),
    ];
    let fileExtention = getFileExtension(options.libraryTarget);
    return {
        mode: mode,
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, "lib"),
            filename: 'tex2max.' +
            fileExtention
            + '.js',
            libraryExport: 'default',
            libraryTarget: options.libraryTarget,
            umdNamedDefine: true,
            globalObject: `(typeof self !== 'undefined' ? self : this)`
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: "babel-loader"
                    }
                }
            ]
        },
        plugins: plugins
    };
}

let variants = {
    libraryTarget: ['commonjs2', 'amd']
};

let variantsConfig = createVariants(variants, createConfig);

module.exports = [...variantsConfig, umdConfig];
