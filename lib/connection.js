module.exports = Connection;

/**
 * Upgrade a `net.Socket` like object into a pubsub protocol specific connection object.
 *
 * #### Events
 *
 * **Event: `connect`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `ctx.auth` - `Object` containing auth information
 * - `ctx.auth.username` - `Object` containing client username
 * - `ctx.auth.password` - `Object` containing client password
 *
 * Emitted on successful connection (or reconnection).
 *
 * **Event: `error`**
 *
 * Emitted when a connection error has occurred.
 *
 * **Event: `publish`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `ctx.topic` - `String` the topic the client would like to publish the message to
 * - `ctx.message` - `String` or `Buffer` the message to publish
 * - `ctx.options` - `Object` protocol specific options
 *
 * **Event: `subscribe`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `ctx.topic` - `String` the topic the client would like to publish the message to
 * - `ctx.options` - `Object` protocol specific options
 *
 * **Event: `unsubscribe`**
 *
 * Emitted with a `ctx` object containing the following.
 *
 * - `String` the topic the client would like to unsubscribe from.
 *
 * @param {net.Socket} socket The `Socket` like object to upgrade.
 * @class
 */

function Connection(socket) {
}

/**
 * Acknowledge the given `action`. You must provide the `ctx` object emitted by the `connection`.
 *
 * @param {Object} ctx The context object provided by the `action` event.
 * @callback {Function} callback Called once the ack has been performed on the connection.
 * @param {Error} err A `socket.write()` error (if one occured).
 */

Connection.prototype.ack = function(action, ctx, cb) {
}

/**
 * Publish a message using the connection.
 *
 * @param {String|Object} topic The topic to publish to
 * @param {String|Buffer} message The message to publish
 * @param {Object} options The protocol specific publish options
 * @callback {Function} callback Called once the publish has been performed on the connection.
 * @param {Error} err A `socket.write()` error (if one occured).
 */

Connection.prototype.publish = function(topic, message, options, cb) {
}
