<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.query('SET wait_timeout = 1');

var errorErr;
var endErr;
connection
  .on('end', function(err) {
    assert.ok(!endErr);
    endErr = err;
  })
  .on('error', function(err) {
    assert.ok(!errorErr);
    errorErr = err;
  });

process.on('exit', function() {
  assert.strictEqual(errorErr.code, 'PROTOCOL_CONNECTION_LOST');
  assert.strictEqual(errorErr.fatal, true);

  assert.strictEqual(endErr, errorErr);
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.query('SET wait_timeout = 1');

var errorErr;
var endErr;
connection
  .on('end', function(err) {
    assert.ok(!endErr);
    endErr = err;
  })
  .on('error', function(err) {
    assert.ok(!errorErr);
    errorErr = err;
  });

process.on('exit', function() {
  assert.strictEqual(errorErr.code, 'PROTOCOL_CONNECTION_LOST');
  assert.strictEqual(errorErr.fatal, true);

  assert.strictEqual(endErr, errorErr);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
