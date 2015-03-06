var net = require('net');

module.exports = function tryPort(port, cb) {
  var connection = net.createConnection(port);
  connection.on('error', function() {
    tryPort(port, cb);
  });
  connection.on('connect', function() {
    cb();
  });
}
