## Installation

```
$ npm install strong-pubsub
```

## Use

```js
var Client = require('strong-pubsub');

// two clients connecting to the same broker
var siskel = new Client({host: 'http://my.message-broker.com', port: 3000});
var ebert = new Client({host: 'http://my.message-broker.com', port: 3000});

siskel.subscribe('movies');
siskel.on('message', function(topic, msg) {
 console.log(topic, msg.toString()); // => movies birdman
});

ebert.publish('movies', 'birdman');
```

## Client (strong-pubsub)

The `Client` class provides a unified pubsub client in Node.js and browsers. It supports subscribing 
to topics or topic patterns (topics and wildcards). Clients can connect to brokers or proxies that support 
the client.adapter’s protocol.

```js
var Client = require('strong-pubsub');
var Adapter = require('strong-pubsub-mqtt');

// create a client with a url
var client = new Client('mqtt://localhost:3456', Adapter);

// or create a client with an options object
var client = new Client({
  host: 'localhost',
  port: 3456
}, Adapter);
```

## Proxy (strong-pubsub-proxy)

In some cases, clients should not connect directly to a message broker. The Proxy class allows 
clients to indirectly connect to a broker. The proxy supports hooks for injecting logic between the 
client and the broker. Hooks allow you to implement client authentication and client action (publish, subscribe) 
authorization using vanilla node.js.

Proxies also allow clients to connect to brokers over a protocol that the broker may not support. 
For example, a client can connect to the proxy using one protocol (eg. MQTT) and the proxy will connect 
to the broker using another (eg. STOMP).

![Proxy](/assets/proxy.png "Pubsub Proxy")

Note: some listening and connect protocol / transport combinations will not support all features of a given protocol. For example QoS settings will be not be guaranteed when a proxy is using an MQTT protocol connection and proxying the connection to a redis broker.

### Creating a proxy

Here is an example setting up a proxy. This would proxy messages between MQTT clients and a RabbitMQ server.

```js
// my-proxy-server.js
var server = require('./my-existing-server');

var Adapter = require('strong-pubsub-mqtt');
var client = new Client('mqtt://my.mosquitto.org', Adapter);
var Connection = require('strong-pubsub-connection-mqtt');

server.on('connection', function(connection) {
  mqttConnection = new Connection(connection);
  var proxy = new Proxy(mqttConnection, client);
});
```

## Message broker

To distribute a message published to a topic, a client connects to a message broker. 
Client adapters allow pubsub clients to connect to various brokers. Clients can connect directly 
to brokers or indirectly using a proxy.
 
## Adapter

Client adapters implement the `Client` API in a broker protocol-specific way.

Specify the adapter specific options using the name as the key.

```js
{
  mqtt: {
    clientId: 'foobar'
  }
}
```

###Protocols

Strong-pubsub supports these two protocols:

- [MQTT](http://mqtt.org/) 
- [STOMP](https://stomp.github.io/)

It is possible to extend strong-pubsub to support other protocols, but that is beyond the scope of this document.

###Transports

Adapters / Clients require a tranpsort to create a connection and read / write data to / from.

A module (or object) that implements `net.createConnection()`.

- The standard TCP protocol: `require('net')`
- Transport Layer Security (TLS), a secure cryptographic protocol: `require('tls')`
- [Primus](https://github.com/primus/primus) (in development): `require('strong-pubsub-transport-primus')`  

## Connection

A Protocol connection implements a specific pubsub protocol in Node.js for use by strong-pubsub-proxy.
 
## Architecture

This diagram illustrates how messages flow between clients, proxies, servers and brokers. 
The blue arrows represent a message published to a topic. The green arrow represents the message 
being sent to a subscriber.

![Pubsub Architecture](/assets/pubsub-arch.png "Pubsub Architecture")
 
## Modules / Plugins

- [strong-pubsub-proxy](http://github.com/strongloop/strong-pubsub-proxy)
- [strong-pubsub-mqtt](http://github.com/strongloop/strong-pubsub-mqtt)
- [strong-pubsub-redis](http://github.com/strongloop/strong-pubsub-redis)
- [strong-pubsub-connection-mqtt](http://github.com/strongloop/strong-pubsub-connection-mqtt)
   
## Examples

TBD
