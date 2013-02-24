<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection({port: common.bogusPort});
var assert     = require('assert');

var err;
connection.connect(function(_err) {
  err = _err;
});

process.on('exit', function() {
  assert.ok(err.stack.indexOf(__filename) > 0);
});
=======
var common     = require('../../common');
var connection = common.createConnection({port: common.bogusPort});
var assert     = require('assert');

var err;
connection.connect(function(_err) {
  err = _err;
});

process.on('exit', function() {
  assert.ok(err.stack.indexOf(__filename) > 0);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
