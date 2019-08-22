const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = '../src/';

module.exports = {
    entry: {
        popup: path.join(__dirname, srcDir + 'popup.tsx'),
        options: path.join(__dirname, srcDir + 'options.tsx'),
        background: path.join(__dirname, srcDir + 'background.tsx'),
        content_script: path.join(__dirname, srcDir + 'content_script.tsx')
    },
    output: {
        path: path.join(__dirname, '../dist/js'),
        filename: '[name].js'
    },
    optimization: {
        // splitChunks: {
        //     name: 'vendor',
        //     chunks: 'initial'
        // }
        runtimeChunk: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new CopyPlugin([
            { from: '.', to: '../' }
          ],
          {context: 'public' }
        ),
    ],
    watchOptions: {
        poll: true
    },
};