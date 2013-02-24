<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var pingErr;

connection.ping(function(err) {
  pingErr = err;
});

connection.end();

process.on('exit', function() {
  assert.equal(pingErr, null);
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var pingErr;

connection.ping(function(err) {
  pingErr = err;
});

connection.end();

process.on('exit', function() {
  assert.equal(pingErr, null);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
