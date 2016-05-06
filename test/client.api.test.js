// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var helpers = require('strong-pubsub-test');
var getPort = helpers.getFreePort;
var defineClientTests = helpers.defineClientTests;
var usingMosquitto = helpers.usingMosquitto;
var Client = require('../'); // strong-pubsub
var Adapter = require('./fakes/adapter.fake'); // strong-pubsub-mqtt

defineClientTests(Client, Adapter);
