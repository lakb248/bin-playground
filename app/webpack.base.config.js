/**
 * @file webpack base config file
 */
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry: {
        build: './src/index.js',
        vendor: ['vue', 'vue-resource', 'vue-router']
    },
    output: {
        path: require('path').resolve('build') + '/',
        publicPath: '/build/',
        filename: 'build.js',
        chunkFilename: '[hash].[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }, {
            test: /\.vue$/,
            loader: 'vue'
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style', 'css!sass'),
            exclude: /node_modules/
        }, {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192'
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
        new ExtractTextPlugin('index.css')
    ]
};
