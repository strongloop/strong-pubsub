module.exports = Proxy

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var debug = require('debug')('strong-pubsub-proxy');
var debugAction = require('debug')('strong-pubsub-proxy:action');

/**
 * Forward the events of a `connection` using the provided `client`. Also
 * forward the events of the provided `client` to the `connection`.
 *
 * **Example**
 *
 * ```js
 * var net = require('net');
 * var server = net.createServer();
 *
 * var Adapter = require('strong-pubsub-mqtt');
 * var client = new Client('mqtt://my.mosquitto.org', Adapter);
 * var Connection = require('strong-pubsub-connection-mqtt');
 *
 * server.on('connection', function(connection) {
 *   var mqttConnection = new Connection(connection);
 *   var proxy = new Proxy(mqttConnection, client);
 * });
 * ```
 *
 * @prop {Connection} connection The `Connection` instance provided to the `Proxy` constructor.
 * @prop {Client} client The `Client` instance provided to the `Proxy` constructor.
 * @prop {Object[]} hooks An array hook objects.
 * @class
 */

function Proxy(connection, client) {
  EventEmitter.call(this);
  var proxy = this;
  this.connection = connection;
  this.client = client;
  var hooks = this.hooks = {};
}

inherits(Proxy, EventEmitter);

Proxy.actions = ['connect', 'publish', 'subscribe', 'unsubscribe'];

Proxy.prototype.connect = function(cb) {
  var proxy = this;
  var hooks = this.hooks;
  var client = this.client;
  var connection = this.connection;

  client.on('message', function(topic, message, options) {
    debug('message received from topic: %s', topic);
    connection.publish(topic, message, options);
  });

  Proxy.actions.forEach(function(action) {
    hooks[action] = hooks[action] || [];
    connection.on(action, function(ctx) {
      debugAction(action + ' %j', ctx);
      switch(action) {
        case 'connect':
          done();
        break;
        default:
          proxy.trigger(action, ctx, function(err) {
            if(err) {
              return connection.onError(action, ctx, err);
            }

            switch(action) {
              case 'publish':
                client.publish(ctx.topic, ctx.message, ctx.options, done);
              break;
              case 'subscribe':
                client.subscribe(ctx.subscriptions || ctx.topic, ctx.options, done);
              break;
              case 'unsubscribe':
                client.unsubscribe(ctx.unsubscriptions || ctx.topic, done);
              break;
            }
          });
        break;
      }

      function done(err) {
        if(err) {
          // error interacting with broker
          error(err);
          client.end();
        }

        connection.ack(action, ctx, function(err) {
          if(err) {
            // error sending ack
            connection.close();
            error(err);
          }
        });
      }
    });
  });

  client.on('error', error);
  connection.on('error', error);

  function error(err) {
    proxy.emit('error', err);
  }
}

Proxy.prototype.before = function(action, hook) {
  this.hooks[action].push(hook);
}

Proxy.prototype.trigger = function(action, ctx, cb) {
  var hooks = this.hooks[action];
  var numHooks = hooks && hooks.length;
  var cur = 0;

  if(!numHooks) {
    return process.nextTick(cb);
  }

  hooks[0].hook(ctx, next);

  function next(err) {
    if(err || cur === numHooks) {
      return cb(err);
    }

    hooks[++cur].hook(ctx, next);
  }
}
