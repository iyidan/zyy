<<<<<<< HEAD
var common    = require('../../common');
var assert    = require('assert');
var pool      = common.createPool();
var poolEnded = false;

pool.end(function(err) {
  poolEnded = true;
  if (err) throw err;
});

process.on('exit', function() {
  assert(poolEnded);
});
=======
var common    = require('../../common');
var assert    = require('assert');
var pool      = common.createPool();
var poolEnded = false;

pool.end(function(err) {
  poolEnded = true;
  if (err) throw err;
});

process.on('exit', function() {
  assert(poolEnded);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
