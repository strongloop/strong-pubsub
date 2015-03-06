var Client = require('../../strong-pubsub-client');
var Adapter = require('../../strong-pubsub-mqtt');
var helpers = require('strong-pubsub-test');
var defineClientBehaviorTests = helpers.defineClientBehaviorTests;
var usingMosquitto = helpers.usingMosquitto;

describe('mqtt client behavior', function () {
  beforeEach(function(done) {
    var test = this;
    usingMosquitto(function(err, port) {
      test.port = port;
      done(err);
    });
  });

  defineClientBehaviorTests(Client, Adapter);
});
