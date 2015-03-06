var path = require('path');
var duplex = require('duplex');
var helpers = require('strong-pubsub-test');
var Client = require('strong-pubsub-client');
var Proxy = require('strong-pubsub-proxy');
var Adapter = require('strong-pubsub-mqtt');
var Connection = require('strong-pubsub-connection-mqtt');
var http = require('http');
var net = require('net');
var browserify = require('browserify');
var express = require('express');
var Primus = require('primus');

var HTTP_PORT = process.env.HTTP_PORT || 3000;
var TCP_PORT = process.env.TCP_PORT || 4000;
var MOSQUITTO_PORT = process.env.MOSQUITTO_PORT || 6000;

var mosquitto = helpers.setupMosquitto(MOSQUITTO_PORT);

helpers.waitForConnection(MOSQUITTO_PORT, function() {
  console.log('mosquitto started on %s', MOSQUITTO_PORT);

  var app = express();

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/bundle.js', function(req, res) {
    var b = browserify({
      basedir: __dirname,
      debug: true
    });

    b.require('stream');
    b.require('url');
    b.require('util');
    b.require('buffer');

    b.require(path.join(__dirname, 'browser.js'), {expose: 'pubsub-client'});

    b.bundle().pipe(res);
  });

  var httpServer = http.createServer(app);
  var tcpServer = net.createServer();
  var primus = new Primus(httpServer, {
    transformer: 'engine.io',
    parser: 'binary'
  });

  var client = new Client({port: MOSQUITTO_PORT}, Adapter);

  client.connect();

  primus.on('connection', function(spark) {
    var connection = duplex();
    var proxy = new Proxy(
      // upgrade the primus spark into an strong-pubsub-connection
      new Connection(connection),
      client
    );

    connection.on('_data', function(chunk) {
      // someone called `connection.write(buf)`
      spark.write(chunk);
    });

    spark.on('data', function(chunk) {
      connection._data(chunk);
    });

    proxy.connect();
  });

  tcpServer.on('connection', function(socket) {
    var proxy = new Proxy(
      // upgrade the tcp socket into an strong-pubsub-connection
      new Connection(socket),
      client
    );

    proxy.connect();
  });

  httpServer.listen(HTTP_PORT, function(err) {
    console.log(err || 'HTTP server listening at port ' + HTTP_PORT);
  });

  tcpServer.listen(TCP_PORT, function(err) {
    console.log(err || 'TCP server listening at port ' + TCP_PORT);
  });
});
