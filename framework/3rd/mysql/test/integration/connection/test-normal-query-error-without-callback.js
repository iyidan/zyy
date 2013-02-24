<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect();
var query = connection.query('INVALID SQL');

var err;
query.on('error', function(_err) {
  assert.equal(err, undefined);
  err = _err;
});

connection.end();

process.on('exit', function() {
  assert.equal(err.code, 'ER_PARSE_ERROR');
  assert.equal(Boolean(err.fatal), false);
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect();
var query = connection.query('INVALID SQL');

var err;
query.on('error', function(_err) {
  assert.equal(err, undefined);
  err = _err;
});

connection.end();

process.on('exit', function() {
  assert.equal(err.code, 'ER_PARSE_ERROR');
  assert.equal(Boolean(err.fatal), false);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
