<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection({port: common.bogusPort});
var assert     = require('assert');

connection.connect();
connection.query('SELECT 1');

var err;
connection.on('error', function(_err) {
  assert.equal(err, undefined);
  err = _err;
});

process.on('exit', function() {
  assert.equal(err.code, 'ECONNREFUSED');
  assert.equal(err.fatal, true);
});
=======
var common     = require('../../common');
var connection = common.createConnection({port: common.bogusPort});
var assert     = require('assert');

connection.connect();
connection.query('SELECT 1');

var err;
connection.on('error', function(_err) {
  assert.equal(err, undefined);
  err = _err;
});

process.on('exit', function() {
  assert.equal(err.code, 'ECONNREFUSED');
  assert.equal(err.fatal, true);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
