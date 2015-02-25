module.exports = MQTTAdapter;

var mqtt = require('mqtt');
var urlUtil = require('url');

function MQTTAdapter(options) {
  var adapter = this;
  this.options = options;
  var client = this.client = mqtt.connect(this.url());

  client.on('message', function(topic, message) {
    adapter.emit('message', message);
  });

  client.on('error', function(err) {
    adapter.emit('error');
  });
}

MQTTAdapter.prototype.url = function() {
  return urlUtil.format(this.options);
}

MQTTAdapter.prototype.publish = function(msg, cb) {
  this.client.publish(this.options.topic, msg);
}

MQTTAdapter.prototype.subscribe = function(cb) {
  var adapter = this;
  var client = this.client;

  client.subscribe(this.options.topic, cb);
}

MQTTAdapter.prototype.end = function(cb) {
  this.client.end(cb);
}
