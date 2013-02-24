<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect();

var gotEnd = false;
connection.on('end', function(err) {
  assert.equal(gotEnd, false);
  assert.ok(!err);

  gotEnd = true;
});

var gotCallback = false;
connection.end(function(err) {
  if (err) throw err;

  assert.equal(gotCallback, false);
  gotCallback = true;
});

process.on('exit', function() {
  assert.equal(gotCallback, true);
  assert.equal(gotEnd, true);
});

=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect();

var gotEnd = false;
connection.on('end', function(err) {
  assert.equal(gotEnd, false);
  assert.ok(!err);

  gotEnd = true;
});

var gotCallback = false;
connection.end(function(err) {
  if (err) throw err;

  assert.equal(gotCallback, false);
  gotCallback = true;
});

process.on('exit', function() {
  assert.equal(gotCallback, true);
  assert.equal(gotEnd, true);
});

>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
