var helpers = require('strong-pubsub-test');
var getPort = helpers.getFreePort;
var defineClientTests = helpers.defineClientTests;
var usingMosquitto = helpers.usingMosquitto;
var Client = require('../../strong-pubsub-client');
var Adapter = require('../'); // strong-pubsub-mqtt

describe('MQTT', function () {
  beforeEach(function(done) {
    var test = this;
    usingMosquitto(function(err, port) {
      test.port = port;
      done(err);
    });
  });

  defineClientTests(Client, Adapter);
});
