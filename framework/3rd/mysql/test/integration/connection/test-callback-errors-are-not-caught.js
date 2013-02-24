<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var err = new Error('uncaught exception');

connection.connect(function() {
  throw err;
});

var caughtErr;
process.on('uncaughtException', function(err) {
  caughtErr = err;
  process.exit(0);
});

process.on('exit', function() {
  assert.strictEqual(caughtErr, err);
});

=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var err = new Error('uncaught exception');

connection.connect(function() {
  throw err;
});

var caughtErr;
process.on('uncaughtException', function(err) {
  caughtErr = err;
  process.exit(0);
});

process.on('exit', function() {
  assert.strictEqual(caughtErr, err);
});

>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
