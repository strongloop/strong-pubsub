var helpers = require('strong-pubsub-test');
var getFreePort = helpers.getFreePort;
var waitForConnection = helpers.waitForConnection;
var setupRedis = require('./redis');

module.exports = function(cb) {
  getFreePort(function(port) {
    var redis = setupRedis(port);
    waitForConnection(port, function(err) {
      if(err) return cb(err);
      cb(null, port, redis);
    });
  });
}
