module.exports = function defineClientTests(Client, Adapter, timeout) {
  describe('Client', function () {
    this.timeout(timeout || 0);

    describe('client.connect(callback)', function() {
      it('Connect to the broker or proxy.', function (done) {
        var client = new Client({port: this.port}, Adapter);
        client.connect(done);
      });
    });

    describe('client with a connection established', function() {
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

}
