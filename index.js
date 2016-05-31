var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(request, response){
    response.sendFile(path.join(__dirname, '/app/index.html'));
});

http.createServer(app).listen('8080', function () {
    console.log('create server');
});
