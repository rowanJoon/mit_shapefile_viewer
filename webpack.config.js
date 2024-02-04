const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/App.ts',
    resolve: {
        modules: [path.join(__dirname, "src"), "node_modules"],
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
            {
                test:/\.html$/,
                use:[
                    {
                        loader:'html-loader',
                        options:{minimize:true}
                    }
                ]
            },
        ],
    },
    devServer: {
        host: "localhost",
        static: {
            directory: path.resolve(__dirname, "dist"),
        },
        port: 3000,
    },
    plugins:[
        new HtmlWebPackPlugin({
            template:'./src/index.html',
            filename:'./index.html',
            inject: false
        }),
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
};