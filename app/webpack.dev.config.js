/**
 * @file webpack dev config file
 */
var config = require('./webpack.base.config');

config.devtool = 'inline-source-map';

module.exports = config;
