<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect(function(err) {
  if (err) throw err;

  connection.destroy();
});
=======
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.connect(function(err) {
  if (err) throw err;

  connection.destroy();
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
