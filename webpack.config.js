const path = require('path');

module.exports = {
    entry: './src/app.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: 'SpaceGame',       // global namespace
        libraryTarget: 'window'     // attach to window.SpaceGame
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // serve files from dist
        },
        compress: true,
        port: 3000,
        hot: true,   // enable hot module replacement
        open: true   // auto open browser
    }
};
