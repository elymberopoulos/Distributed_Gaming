const fs = require('fs');
module.exports = {
    target: 'web',
    entry: './public/js/index.js',
    output: {
        path: __dirname + "/public/js/webpack_output",
        filename: 'webpackOutput.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }

        ]
    },
    mode: 'development'
}