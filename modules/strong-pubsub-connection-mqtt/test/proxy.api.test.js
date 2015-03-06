var Client = require('../../strong-pubsub-client');
var Adapter = require('../../strong-pubsub-mqtt');
var Connection = require('../'); // strong-pubsub-connection-mqtt
var Proxy = require('../../strong-pubsub-proxy');
var helpers = require('strong-pubsub-test');
var usingMosquitto = helpers.usingMosquitto;
var getPort = helpers.getFreePort;

describe('Proxy', function () {
  describe('proxy.connect(cb)', function () {
    beforeEach(function(done) {
      var test = this;
      usingMosquitto(function(err, port) {
        test.brokerPort = port;
        done(err);
      });
    });

    beforeEach(function(done) {
      var server = this.server = require('net').createServer();
      var test = this;
      getPort(function(port) {
        server.on('connection', function(connection) {
          var proxy = new Proxy(
            new Connection(connection),
            new Client({port: test.brokerPort}, Adapter)
          );

          proxy.connect();
        });
        test.port = port;
        server.listen(port, done);
      });
    });

    describe('client with a connection to a proxy', function() {
      beforeEach(function(done) {
        this.topic = 'test topic';
        this.message = 'test message';
        var client = this.client = new Client({port: this.port}, Adapter);
        client.connect(done);
      });

      describe('client.publish(topic, message, options, callback)', function() {
        it('Publish a `message` to the specified `topic`', function (done) {
          this.client.publish(this.topic, this.message, done);
        });
      });

      describe('client.subscribe(topic, options, cb', function() {
        it('Subscribe to the specified `topic` or **topic pattern**.', function (done) {
          this.client.subscribe(this.topic, done);
        });
      });

      describe('client.unsubscribe(topic, options, cb', function() {
        it('Unsubscribe from the specified `topic` or **topic pattern**.', function (done) {
          var test = this;
          this.client.subscribe(this.topic, function(err) {
            if(err) return done(err);
            test.client.unsubscribe(test.topic, done);
          });
        });
      });
    });
  });
});
