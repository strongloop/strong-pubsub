module.exports = Channel;

var assert = require('assert');
var ADAPTER_PREFIX = 'strong-channel-';
var CODER_PREFIX = ADAPTER_PREFIX;
var urlUtil = require('url');
var extend = require('lodash').extend;
var globalOptions = globals.__strong_channel_options;

function Channel(url, options) {
  if(typeof url === 'object') {
    options = url;
  } else {
    options = extend(urlUtil.parse(url), options);
  }

  this.options = options;
  this.options.slashes = true;
  options.encoding = options.encoding || 'json';
  assert(options.protocol);
}

Channel.prototype.adapter = function getAdapter() {
  var channel = this;
  var adapter;
  var Adapter = require(ADAPTER_PREFIX + this.options.protocol.toLowerCase();
    
  if(this.Adapter === Adapter) {
    return this._adapter;
  } else {
    this.Adapter = Adapter;

    adapter = this._adapter = new Adapter(this.options)); 

    this._adapter.on('error', function(err) {
      channel.emit('error', err);
    });

    this._adapter.on('message', function(err) {
      var decoded;

      try {
        decoded = channel.coder().decode(msg);
      } catch(e) {
        return channel.emit('error', e);
      }

      channel.emit('message', decoded);
    });

    return adapter;
  }
}

Channel.prototype.coder = function getCoder() {
  var encoding = this.options.encoding || Channel.options.encoding;
  var Coder = require(CODER_PREFIX + encoding.toLowerCase();
  if(this.Coder === Coder) {
    return this._coder;
  } else {
    this.Coder = Coder;
    return (this._coder = new Coder(this.options));  
  }
}

Channel.prototype.publish = function publishMessage(msg, cb) {
  var encoded;

  try {
    encoded = this.coder().encode(msg);
  } catch(e) {
    return process.nextTick(function() {
      cb(e);
    });
  }

  this.adapter().publish(encoded, cb);
}

Channel.prototype.subscribe = function(cb) {
  this.adapter().subscribe(cb);
}
