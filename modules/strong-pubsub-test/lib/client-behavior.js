var extend = require('lodash').merge;
var expect = require('chai').expect;

module.exports = function(Client, Adapter, options) {
  options = options || {};
  
  describe('client', function () {
    beforeEach(function() {
      var client = this.client = new Client(extend({
        port: this.port
      }, options), Adapter);
      var peer = this.peer = new Client(extend({
        port: this.port
      }, options), Adapter);
    });

    describe('publishing to a topic', function() {
      it('should be received by clients subscribed to the topic', function (done) {
        this.timeout(3000);

        var topic = 'my test topic';
        var msg = 'my test message';
        var peer = this.peer;
        var client = this.client;

        peer.subscribe(topic);
        peer.on('message', function(topic, receivedMsg) {
          expect(msg).to.equal(receivedMsg.toString());
          done();
        });

        var client = this.client;
        client.publish(topic, msg);
      });
    });
  });
}
