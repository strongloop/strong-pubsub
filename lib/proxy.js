module.exports = Proxy;

function Proxy() {
  this.incoming = [];
  this.outgoing = [];
}

Proxy.prototype.listen = function(options, cb) {
  if(typeof options === 'string') {
    options = urlUtil.parse(options);
  }

  var Server = serverForProtocol(options.protocol);
  var server = new Server();
  var proxy = this;

  server.on('connection', function(client) {
    client.on('subscribe', function(topic) {
      proxy.createChannel(client, topic).subscribe(function(err) {
        if(err) {
          client.handleError('subscribe', err);
        }
      });
    });
    client.on('publish', function(topic, msg) {
      proxy.createChannel(client, topic).publish(msg, function(err) {
        if(err) {
          client.handleError('publish', err);
        }
      });
    });
  });

  server.listen(options.hostname, options.port, cb);

  return server;
}

function serverForProtocol(protocol) {
  protocol = protocol.replace(':', '');
  return require('strong-channel-server-' + protocol);
}
