<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var rows;
connection.query('SELECT ""', function(err, _rows) {
  if (err) throw err;

  rows = _rows;
});

connection.end();

process.on('exit', function() {
  assert.deepEqual(rows, [{'': ''}]);
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

var rows;
connection.query('SELECT ""', function(err, _rows) {
  if (err) throw err;

  rows = _rows;
});

connection.end();

process.on('exit', function() {
  assert.deepEqual(rows, [{'': ''}]);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
