var Client = require('../../strong-pubsub-client');
var Adapter = require('../../strong-pubsub-mqtt');
var Connection = require('../'); // strong-pubsub-connection-mqtt
var Proxy = require('../../strong-pubsub-proxy');
var helpers = require('strong-pubsub-test');
var usingMosquitto = helpers.usingMosquitto;
var waitUntilAcceptingConnections = helpers.waitForConnection;
var defineProxyBehaviorTests = helpers.defineProxyBehaviorTests;
var getPort = helpers.getFreePort;

describe('proxy behavior', function () {
  beforeEach(function(done) {
    var test = this;
    usingMosquitto(function(err, port) {
      test.brokerPort = port;
      done(err);
    });
  });

  defineProxyBehaviorTests(Proxy, Client, Adapter, Connection, {
    qos: 2,
    retain: true
  });
});
