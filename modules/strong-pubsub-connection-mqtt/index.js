module.exports = Connection;

var MqttConnection = require('mqtt-connection');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var debug = require('debug')('strong-pubsub-connection:mqtt');

/**
 * Upgrade a `net.Socket` like object into a protocol specific connection object.
 *
 * #### Events
 *
 * **Event: `connect`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `ctx.auth` - `Object` containing auth information
 * - `ctx.auth.username` - `Object` containing client username
 * - `ctx.auth.password` - `Object` containing client password
 *
 * Emitted on successful connection (or reconnection).
 *
 * **Event: `error`**
 *
 * Emitted when a connection error has occurred.
 *
 * **Event: `publish`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `ctx.topic` - `String` the topic the client would like to publish the message to
 * - `ctx.message` - `String` or `Buffer` the message to publish
 * - `ctx.options` - `Object` protocol specific options
 *
 * **Event: `subscribe`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `ctx.topic` - `String` the topic the client would like to publish the message to
 * - `ctx.options` - `Object` protocol specific options
 *
 * **Event: `unsubscribe`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `ctx.topic` - `String` the topic the client would like to publish the message to
 *
 * @param {net.Socket} socket The `Socket` like object to upgrade.
 * @class
 */

function Connection(socket) {
  EventEmitter.call(this);
  var connection = this;
  var mqttConnection = this.mqttConnection = new MqttConnection(socket);

  mqttConnection.on('connect', function(packet) {
    connection.emit('connect', {
      auth: {
        username: packet.username,
        password: packet.password
      },
      mqttPacket: packet
    });
  });

  mqttConnection.on('publish', function(packet) {
    connection.emit('publish', {
      topic: packet.topic,
      message: packet.payload,
      options: {qos: packet.qos},
      mqttPacket: packet
    });
  });

  mqttConnection.on('subscribe', function(packet) {
    var subscriptions = {};
    packet.subscriptions.forEach(function(subscription) {
      subscriptions[subscription.topic] = {qos: subscription.qos};
    });
    connection.emit('subscribe', {
      subscriptions: subscriptions,
      mqttPacket: packet
    });
  });

  mqttConnection.on('unsubscribe', function(packet) {
    connection.emit('unsubscribe', {
      unsubscriptions: packet.unsubscriptions,
      mqttPacket: packet
    });
  });
}

inherits(Connection, EventEmitter);

Connection.prototype.ack = function(action, ctx, cb) {
  var mqttConnection = this.mqttConnection;
  var messageId = ctx.mqttPacket && ctx.mqttPacket.messageId;

  debug('ack %s', action);

  switch(action) {
    case 'connect':
      var code = ctx.returnCode || 0;
      if(ctx.error) {
        code = ctx.returnCode || 2;
      }

      mqttConnection.connack({
        returnCode: code
      }, cb);
    break;
    case 'subscribe':
      mqttConnection.suback({
        messageId: messageId,
        granted: ctx.mqttPacket.subscriptions.map(function (e) {
          return e.qos;
        })
      }, cb);
    break;
    case 'unsubscribe':
      mqttConnection.unsuback({
        messageId: messageId,
      }, cb);
    break;
    case 'publish':
      switch(ctx.qos) {
        case 1:
          mqttConnection.puback({messageId: messageId}, cb);
        break;
        case 2:
          mqttConnection.pubrec({messageId: messageId}, cb);
        break;
        default:
          // no acknowledgement
          process.nextTick(cb);
        break;
      }
    break;
  }
}

Connection.prototype.publish = function(topic, message, options, cb) {
  options = options || {};
  this.mqttConnection.publish({
    topic: topic,
    payload: message,
    qos: options.qos,
    retain: options.retain
  }, cb);
}
