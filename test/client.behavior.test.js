var Client = require('../../strong-pubsub');
var Adapter = require('./fakes/adapter.fake.js');
var helpers = require('strong-pubsub-test');
var defineClientBehaviorTests = helpers.defineClientBehaviorTests;

describe('client behavior', function () {
  defineClientBehaviorTests(Client, Adapter);
});
