var path = require('path');
var SANDBOX = path.join('..', __dirname, 'sandbox');
var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function(port) {
  return spawn('redis-server', ['--port', port, '--loglevel', 'verbose'], {stdio:  ['ignore', process.stdout, process.stderr]});
}
