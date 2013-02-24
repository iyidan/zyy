<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect();

var rows = undefined;
var fields = undefined;
connection.query('SELECT 1', function(err, _rows, _fields) {
  if (err) throw err;

  rows = _rows;
  fields = _fields;
});

connection.end();

process.on('exit', function() {
  assert.deepEqual(rows, [{1: 1}]);
  assert.equal(fields[0].name, '1');
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect();

var rows = undefined;
var fields = undefined;
connection.query('SELECT 1', function(err, _rows, _fields) {
  if (err) throw err;

  rows = _rows;
  fields = _fields;
});

connection.end();

process.on('exit', function() {
  assert.deepEqual(rows, [{1: 1}]);
  assert.equal(fields[0].name, '1');
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
