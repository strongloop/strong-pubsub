var path = require('path');
var SANDBOX = path.join('..', __dirname, 'sandbox');
var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function(port) {
  var child = spawn('mosquitto', ['-p', port, '-v'], {stdio:  ['ignore', process.stdout, process.stderr]});
}
