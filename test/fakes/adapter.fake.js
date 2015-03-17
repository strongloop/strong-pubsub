module.exports = Adapter;

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function Adapter(client) {
  var adapter = this;
  this.client = client;
  var options = this.options = client.options;
  process.on('pubsub message', function(topic, message, options) {
    client.emit('message', topic, message, options);
  });
}

inherits(Adapter, EventEmitter);

Adapter.prototype.connect = function(cb) {
  process.nextTick(cb);
}

Adapter.prototype.end = function(cb) {
  process.nextTick(cb);
}

Adapter.prototype.publish = function(topic, message, options, cb) {
  var client = this.client;

  process.nextTick(function() {
    // faux (in-process) broker
    process.emit('pubsub message', topic, message, options);
    cb && cb();
  });
}

Adapter.prototype.subscribe = function(topic, options, cb) {
  process.nextTick(cb);
}

Adapter.prototype.unsubscribe = function(topic, cb) {
  process.nextTick(cb);
}
