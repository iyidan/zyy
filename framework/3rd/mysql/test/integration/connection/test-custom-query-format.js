<<<<<<< HEAD
var Mysql      = require('../../../');
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.config.queryFormat = function (query, values, tz) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

assert.equal(connection.format("SELECT :a1, :a2", { a1: 1, a2: 'two' }), "SELECT 1, 'two'");
assert.equal(connection.format("SELECT :a1", []), "SELECT :a1");
assert.equal(connection.format("SELECT :a1"), "SELECT :a1");
=======
var Mysql      = require('../../../');
var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

connection.config.queryFormat = function (query, values, tz) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

assert.equal(connection.format("SELECT :a1, :a2", { a1: 1, a2: 'two' }), "SELECT 1, 'two'");
assert.equal(connection.format("SELECT :a1", []), "SELECT :a1");
assert.equal(connection.format("SELECT :a1"), "SELECT :a1");
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
