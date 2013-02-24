<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var didConnect = false;
connection.connect(function(err) {
  if (err) throw err;

  assert.equal(didConnect, false);
  didConnect = true;
});

var err;
connection.connect(function(_err) {
  err = _err;
});

connection.end();

process.on('exit', function() {
  assert.equal(didConnect, true);
  assert.equal(err.fatal, false);
  assert.equal(err.code, 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE');
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var didConnect = false;
connection.connect(function(err) {
  if (err) throw err;

  assert.equal(didConnect, false);
  didConnect = true;
});

var err;
connection.connect(function(_err) {
  err = _err;
});

connection.end();

process.on('exit', function() {
  assert.equal(didConnect, true);
  assert.equal(err.fatal, false);
  assert.equal(err.code, 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE');
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
