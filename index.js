module.exports = Client;

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function noop() {};

/**
 * The Client class provides a unified pubsub client in node.js and browsers. It
 * supports subscribing to topics or topic patterns (topics + wildcards). Clients
 * can connect to brokers or bridges that support the client.adapter’s protocol.
 *
 * ```js
 * var Client = require('strong-pubsub');
 * var Adapter = require('strong-pubsub-mqtt');
 * var client = new Client({
 *   host: 'my.mqtt-broker.com',
 *   port: 6543
 * }, Adapter);
 * ```
 *
 * #### Events
 *
 * **Event: `connect`**
 *
 * Emitted on successful connection (or reconnection).
 *
 * **Event: `error`**
 *
 * Emitted when a connection could not be established.
 *
 * @param {Object} options See `client.options` below.
 * @param {Function} Adapter The adapter constructor.
 * @param {Object} [transport] The optional transport module implementing `require('net').createConnection()`.
 * @property {Object} options The options passed as the first argument to the `Client` constructor.
 * @property {String} options.hostname **required** The host to connect to.
 * @property {String} options.port **required** The port to connect to.
 * @property {Adapter} adapter
 * @property {Object} transport The transport module (eg. `require('net')`) if passed to the `Client` constructor.
 * @class
 */

function Client(options, Adapter, transport) {
  EventEmitter.call(this);
  this.options = options || {};
  this.state = null;
  this.transport = transport;
  this.adapter = new Adapter(this);
  this.setMaxListeners(0);
}

inherits(Client, EventEmitter);

/**
 * Connect to the broker or bridge.
 *
 * @callback {Function} callback Added as a `once` listener to the `connect` event.
 * @param {Error} err A connection error (if one occured).
 */

Client.prototype.connect = function(cb) {
  var state = this.state;
  var client = this;
  cb = cb || noop;

  switch(this.state) {
    case 'connected':
    case 'connecting':
      return process.nextTick(function() {
        cb(new Error('client is already ' + state));
      });
    break;
    default:
      this.state = 'connecting';
      this.adapter.connect(function(err) {
        if(err) return cb(err);
        client.state = 'connected';
        client.emit('connect');
        cb();
      });
    break;
  }
}

/**
 * Disconnect from the broker or bridge.
 *
 * @callback {Function} callback Added as a `once` listener to the `connect` event.
 * @param {Error} err A connection error (if one occured).
 */

Client.prototype.end = function(cb) {
  var state = this.state;
  var client = this;

  switch(this.state) {
    case 'connected':
    case 'connecting':
      this.state = 'closing';
      this.adapter.end(function(err) {
        client.state = 'closed';
        cb(err);
      });
    break;
    default:
      // not connected
      process.nextTick(cb);
    break;
  }
}

/**
 * Publish a `message` to the specified `topic`.
 *
 * @param {String} topic The topic to publish to.
 * @param {String|Buffer} message The message to publish to the topic.
 * @param {Object} [options] Additional options that are not required for publishing a message.
 * @param {Queue} [options.queue] A `Queue` object to bind the topic to. Only supported using the **STOMP** adapter.
 * @param {Number} [options.qos] The **MQTT** QoS (Quality of Service) setting.
 *
 * **Supported Values**
 *
 *   - `0` - Just as reliable as TCP. Client will not get any missed messages (while it was disconnected).
 *   - `1` - Client receives missed messages at least once and sometimes more than once.
 *   - `2` - Client receives missed messages only once.
 *
 * **Note: this setting is not supported by non mqtt brokers!**
 *
 * @callback {Function} callback Called once the adapter has successfully finished publishing the message (usually once the buffer is flushed).
 * @param {Error} err An error object is included if an error was supplied by the adapter.
 */

Client.prototype.publish = function(topic, message, options, cb) {
  var client = this;

  if(typeof options === 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  cb = cb || noop;

  this.ready(function(err) {
    if(err) return cb(err);
    client.adapter.publish(topic, message, options, cb);
  });
}

/**
 * Subscribe to the specified `topic` or **topic pattern**.
 *
 * **Topic Patterns**
 *
 * - The `+` wildcard character matches exactly one word.
 * - The `*` wildcard character matches zero or more words.
 * - Wildcards can be used in combination.
 * - Words are separated by the `/` character.
 *
 * @param {String} topic The topic or **topic pattern** to subscribe to.
 * @param {Object} [options] Options passed to the adapter.
 * @callback {Function} callback Called once the adapter has finished subscribing.
 * @param {Error} err An error object is included if an error was supplied by the adapter.
 */

Client.prototype.subscribe = function(topic, options, cb) {
  var client = this;

  if(typeof options === 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};
  cb = cb || noop;

  this.ready(function(err) {
    if(err) return cb(err);
    client.adapter.subscribe(topic, options, cb);
  });
}

/**
 * Unsubscribe from the specified `topic` or **topic pattern**.
 *
 * @param {String} topic The topic or **topic pattern** to unsubscribe.
 * @callback {Function} callback Called once the adapter has finished unsubscribing.
 * @param {Error} err An error object is included if an error was supplied by the adapter.
 */

Client.prototype.unsubscribe = function(topic, cb) {
  cb = cb || noop;
  var client = this;
  this.ready(function(err) {
    if(err) return cb(err);
    client.adapter.unsubscribe(topic, cb);
  });
}

/**
 * Provide a callback to be called once the `Client` is ready to be used.
 *
 * @callback {Function} callback Called once the `Client` is in a ready state or
 * an error has occurred.
 * @param {Error} err The connection error (if one occurred).
 */

Client.prototype.ready = function(cb) {
  var state = this.state;
  switch(state) {
    case 'connected':
      process.nextTick(cb);
    break;
    case 'connecting':
      this.once('connect', function() {
        cb();
      });
    break;
    case 'closing':
    case 'closed':
      return cb(new Error('client is ' + state));
    break;
    default:
      this.connect(cb);
    break;
  }
} 
