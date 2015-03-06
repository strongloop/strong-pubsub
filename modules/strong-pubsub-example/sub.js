var PORT = process.env.PORT;
var TOPIC = process.env.TOPIC;

var Client = require('strong-pubsub-client');
var Adapter = require('strong-pubsub-mqtt');

var client = new Client({port: PORT}, Adapter);

client.subscribe(TOPIC);

client.on('message', function(topic, msg) {
  console.log(msg.toString());
});
