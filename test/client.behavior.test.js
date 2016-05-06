// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var Client = require('../');
var Adapter = require('./fakes/adapter.fake.js');
var helpers = require('strong-pubsub-test');
var defineClientBehaviorTests = helpers.defineClientBehaviorTests;

describe('client behavior', function () {
  defineClientBehaviorTests(Client, Adapter);
});
