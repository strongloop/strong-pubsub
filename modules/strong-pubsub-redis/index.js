module.exports = Adapter;

var redis = require("redis")
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var debug = require('debug')('strong-pubsub-client:redis');
var defaults = require('lodash').defaults;

function noop() {};

/**
 * The **Redis** `Adapter`.
 *
 * @class
 */

function Adapter(client) {
  var adapter = this;
  this.client = client;
  var options = this.options = client.options;
}

inherits(Adapter, EventEmitter);

Adapter.prototype.connect = function(cb) {
  var adapter = this;
  var client = this.client;
  var options = this.options;
  var pubClient = this.redisPubClient = redis.createClient(
    this.options.port,
    this.options.host,
    this.options.redis
  );
  var subClient = this.redisSubClient = redis.createClient(
    this.options.port,
    this.options.host,
    this.options.redis
  );

  var connacks = 0;
  var clients = this.clients = new EventEmitter();

  subClient.once('connect', onConnect);
  pubClient.once('connect', onConnect);
  pubClient.on('error', clients.emit.bind(clients, 'error'));
  subClient.on('error', clients.emit.bind(clients, 'error'));

  function onConnect() {
    connacks++;
    if(connacks === 2) {
      clients.emit('connect');
    }
  }

  this.clients.once('connect', function() {
    adapter.clients.removeListener('error', cb);
    cb();
  });

  this.clients.once('error', cb);

  subClient.on('message', function(topic, message, options) {
    client.emit('message', topic, message, options);
  });
}

Adapter.prototype.end = function(cb) {
  this.pubClient.end();
  this.subClient.end();
}

/**
 * Publish a `message` to the specified `topic`.
 *
 * @param {String} topic The topic to publish to.
 * @param {String|Buffer} message The message to publish to the topic.
 * @param {Object} [options] Additional options that are not required for publishing a message.
 * @param {Number} [options.qos] **default: `0`** The **MQTT** QoS (Quality of Service) setting.
 * @param {Boolean} [options.retain] **default: `false`**  The `MQTT` retain setting. Whether or not the message should be retained.
 *
 * **Supported Values**
 *
 *   - `0` - Just as reliable as TCP. Adapter will not get any missed messages (while it was disconnected).
 *   - `1` - Adapter receives missed messages at least once and sometimes more than once.
 *   - `2` - Adapter receives missed messages only once.
 *
 * @callback {Function} callback Called once the adapter has successfully finished publishing the message.
 * @param {Error} err An error object is included if an error was supplied by the adapter.
 */

Adapter.prototype.publish = function(topic, message, options, cb) {
  this.redisPubClient.publish(topic, message, cb);
}

/**
 * Subscribe to the specified `topic` or **topic pattern**.
 *
 * @param {String} topic The topic to subscribe to.
 * @param {Object} options The MQTT specific options.
 * @param {Object} options.qos See `publish()` for `options.qos`.
 *
 * @callback {Function} callback Called once the adapter has finished subscribing.
 * @param {Error} err An error object is included if an error was supplied by the adapter.
 * @param {Object[]} granted An array of topics granted formatted as an object `{topic: 't', qos: n}`. 
 * @param {String} granted[n].topic The topic granted 
 * @param {String} granted[n].qos The qos for the topic 
 */

Adapter.prototype.subscribe = function(topic, options, cb) {
  this.redisSubClient.subscribe(topic, cb);
}

/**
 * Unsubscribe from the specified `topic` or **topic pattern**.
 *
 * @param {String} topic The topic or **topic pattern** to unsubscribe.
 * @callback {Function} callback Called once the adapter has finished unsubscribing.
 * @param {Error} err An error object is included if an error was supplied by the adapter.
 */

Adapter.prototype.unsubscribe = function(topic, cb) {
  this.redisSubClient.unsubscribe(topic, cb);
}
