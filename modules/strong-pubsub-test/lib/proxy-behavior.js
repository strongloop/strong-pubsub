var getPort = require('./free-port');
var expect = require('chai').expect;

module.exports = function(Proxy, Client, Adapter, Connection, publishOptions) {
  beforeEach(function(done) {
    var server = this.server = require('net').createServer();
    var test = this;
    getPort(function(port) {
      server.on('connection', function(connection) {
        var proxy = new Proxy(
          new Connection(connection),
          new Client({
            port: test.brokerPort
          }, Adapter)
        );

        proxy.connect();
      });
      test.port = port;
      server.listen(port, done);
    });
  });

  describe('client', function () {
    beforeEach(function() {
      var client = this.client = new Client({
        port: this.port
      }, Adapter);
      var peer = this.peer = new Client({
        port: this.port
      }, Adapter);
      var brokerClient = this.brokerClient = new Client({
        port: this.brokerPort
      }, Adapter);
    });

    describe('publishing to a topic', function() {
      it('should be received by proxy and broker clients subscribed to the topic', function (done) {
        var topic = 'my test topic';
        var msg = 'my test message';
        var peerMessaged = false;
        var brokerClientMessaged = false;
        var peer = this.peer;
        var brokerClient = this.brokerClient;

        [peer, brokerClient].forEach(function(client) {
          client.subscribe(topic);
          client.on('message', function(topic, receivedMsg) {
            expect(msg).to.equal(receivedMsg.toString());
            if(client === peer) {
              peerMessaged = true;
            }
            if(client === brokerClient) {
              brokerClientMessaged = true;
            }
            if(brokerClientMessaged && peerMessaged) {
              done();
            }
          });
        });

        var client = this.client;
        client.publish(topic, msg, publishOptions);
      });
    });
  });
}
