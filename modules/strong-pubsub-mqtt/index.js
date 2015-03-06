module.exports = Adapter;

var MqttClient = require('mqtt/lib/client');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var debug = require('debug')('strong-pubsub-client:mqtt');
var defaults = require('lodash').defaults;

function noop() {};

/**
 * The **MQTT** `Adapter`.
 *
 * **Defaults**
 *
 * - `client.options.mqtt` - The adapter sets these defaults
 * - `client.options.mqtt.protocolId` - `'MQIsdp'`
 * - `client.options.mqtt.protocolVersion` - `3`
 *
 * @class
 */

function Adapter(client) {
  var adapter = this;
  this.client = client;
  var options = this.options = client.options;
  options.mqtt = options.mqtt || {};

  defaults(options.mqtt, {
    protocolId: 'MQIsdp',
    protocolVersion: 3
  });
  
  this.transport = client.transport;
}

inherits(Adapter, EventEmitter);

Adapter.prototype.connect = function(cb) {
  var adapter = this;
  var client = this.client;
  var options = this.options;
  var transport = this.transport || require('net');
  var firstConnection;
  var timer;

  debug('connect');

  this.mqttClient = new MqttClient(function(mqttClient) {
    var connection = transport.createConnection(options.port, options.host);
    if(!firstConnection) {
      firstConnection = connection
    }
    return connection;
  }, options.mqtt);

  this.mqttClient.on('message', function(topic, message, packet) {
    client.emit('message', topic, message, {
      qos: packet.qos || 0,
      retain: packet.retain || false
    });
  });

  firstConnection.once('connect', done);
  firstConnection.once('error', done);

  if(options.connectionTimeout) {
    timer = setTimeout(function() {
      cb(new Error('connection timeout after ' + options.connectionTimeout + 'ms'));
      firstConnection.close();
    }, options.connectionTimeout);
  }

  function done(err) {
    debug('connect done');
    if(err) {
      debug('connect error %j', err);
    }
    adapter.emit('connect');
    clearTimeout(timer);
    cb(err);
  }
}

Adapter.prototype.end = function(cb) {
  this.mqttClient.end(cb);
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
  options = options || {};
  options.qos = options.qos || 0;
  options.retain = options.retain || false;
  this.mqttClient.publish(topic, message, options, cb);
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
  cb = cb || noop;
  options.qos = options.qos || 0;

  if(typeof topic === 'object') {
    Object.keys(topic).forEach(function(name) {
      topic[name] = topic[name].qos || 0;
    });
  }

  this.mqttClient.subscribe(topic, options, cb);
}

/**
 * Unsubscribe from the specified `topic` or **topic pattern**.
 *
 * @param {String} topic The topic or **topic pattern** to unsubscribe.
 * @callback {Function} callback Called once the adapter has finished unsubscribing.
 * @param {Error} err An error object is included if an error was supplied by the adapter.
 */

Adapter.prototype.unsubscribe = function(topic, cb) {
  cb = cb || noop;
  this.mqttClient.unsubscribe(topic, cb);
}
