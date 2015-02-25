module.exports = EngineIOAdapter;

var createSocket = require('engine.io-client');
var urlUtil = require('url');

function EngineIOAdapter(options) {
  var adapter = this;
  this.options = options;
  var client = this.client = createSocket(this.url());

  client.on('message', function(topic, message) {
    adapter.emit(message);
  });

  client.on('error', function(err) {
    adapter.emit('error');
  });
}

EngineIOAdapter.prototype.url = function() {
  return urlUtil.format(this.options);
}

EngineIOAdapter.prototype.publish = function(msg, cb) {
  this.ready(function(err, client) {
    if(err) return cb(err);
    client.send(msg, cb);
  });
}

EngineIOAdapter.prototype.subscribe = function(cb) {
  var adapter = this;
  this.ready(function(err, client) {
    if(err) return cb(err);
  });
}

EngineIOAdapter.prototype.ready = function(cb) {
  var client = this;
  var state = client.readyState || 'state unknown';
  switch(state) {
    case 'open':
      process.nextTick(function() {
        cb(null, client);
      });
    break;
    case 'opening':
      client.once('open', function() {
        cb(null, client);
      });
    break;
    default:
      process.nextTick(function() {
        cb(new Error('connection ' + state));
      });
    break;
  }
}

EngineIOAdapter.prototype.end = function(cb) {
  this.client.once('close', cb);
  this.client.close();
}
