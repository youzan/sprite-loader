var path = require("path");

module.exports = {
    entry: path.join(__dirname, 'index.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: path.join(__dirname, 'dist/')
    },
    module: {
        loaders: [
            {
                test: /\.css/,
                loader: 'style!css!sprite'
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file'
            }
        ]
    }
};
