var helpers = require('strong-pubsub-test');
var getPort = helpers.getFreePort;
var defineClientTests = helpers.defineClientTests;
var usingRedis = helpers.usingRedis;
var Client = require('../../strong-pubsub-client');
var Adapter = require('../'); // strong-pubsub-redis

describe('Redis', function () {
  beforeEach(function(done) {
    var test = this;
    usingRedis(function(err, port, redis) {
      test.port = port;
      test.redis = redis;
      done(err);
    });
  });

  afterEach(function (done) {
    if(this.redis) {
      this.redis.kill('SIGINT');
      done();
    } else {
      done();
    }
  });

  defineClientTests(Client, Adapter);
});
