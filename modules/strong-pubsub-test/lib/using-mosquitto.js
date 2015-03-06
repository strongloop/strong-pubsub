var getFreePort = require('./free-port');
var setupMosquitto = require('./mosquitto');
var waitForConnection = require('./wait-for-connection');

module.exports = function(cb) {
  getFreePort(function(port) {
    setupMosquitto(port);
    waitForConnection(port, function(err) {
      if(err) return cb(err);
      cb(null, port);
    });
  });
}
