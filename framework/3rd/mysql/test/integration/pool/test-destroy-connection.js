<<<<<<< HEAD
var common     = require('../../common');
var assert     = require('assert');
var Connection = require(common.lib + '/Connection');
var pool       = common.createPool();

pool.getConnection(function(err, connection) {
  if (err) throw err;
  assert.strictEqual(connection, pool._allConnections[0]);
  connection.destroy();

  assert.ok(pool._allConnections.length == 0);
  assert.ok(connection._poolRemoved);
  assert.strictEqual(connection.end,     Connection.prototype.end);
  assert.strictEqual(connection.destroy, Connection.prototype.destroy);

  pool.end();
});
=======
var common     = require('../../common');
var assert     = require('assert');
var Connection = require(common.lib + '/Connection');
var pool       = common.createPool();

pool.getConnection(function(err, connection) {
  if (err) throw err;
  assert.strictEqual(connection, pool._allConnections[0]);
  connection.destroy();

  assert.ok(pool._allConnections.length == 0);
  assert.ok(connection._poolRemoved);
  assert.strictEqual(connection.end,     Connection.prototype.end);
  assert.strictEqual(connection.destroy, Connection.prototype.destroy);

  pool.end();
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
