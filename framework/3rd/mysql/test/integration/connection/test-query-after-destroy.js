<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var err;
connection.connect(function() {
  connection.destroy();

  connection.query('SELECT 1', function(_err) {
    err = _err;
  });
});

process.on('exit', function() {
  assert.equal(err.fatal, false);
  assert.equal(err.code, 'PROTOCOL_ENQUEUE_AFTER_DESTROY');
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var err;
connection.connect(function() {
  connection.destroy();

  connection.query('SELECT 1', function(_err) {
    err = _err;
  });
});

process.on('exit', function() {
  assert.equal(err.fatal, false);
  assert.equal(err.code, 'PROTOCOL_ENQUEUE_AFTER_DESTROY');
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
