var helpers = require('strong-pubsub-test');
var getPort = helpers.getFreePort;
var defineClientTests = helpers.defineClientTests;
var usingMosquitto = helpers.usingMosquitto;
var Client = require('../'); // strong-pubsub
var Adapter = require('./fakes/adapter.fake'); // strong-pubsub-mqtt

defineClientTests(Client, Adapter);
