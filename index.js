var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'public/async')));

http.createServer(app).listen('8080', function () {
    console.log('create server');
});
