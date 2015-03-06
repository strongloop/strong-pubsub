var Client = require('../../strong-pubsub-client');
var Adapter = require('../'); // strong-pubsub-redis
var helpers = require('strong-pubsub-test');
var defineClientBehaviorTests = helpers.defineClientBehaviorTests;
var usingRedis = helpers.usingRedis;

describe('redis client behavior', function () {
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

  defineClientBehaviorTests(Client, Adapter);
});
