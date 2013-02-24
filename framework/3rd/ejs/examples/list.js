<<<<<<< HEAD

/**
 * Module dependencies.
 */

var ejs = require('../')
  , fs = require('fs')
  , str = fs.readFileSync(__dirname + '/list.ejs', 'utf8');

var ret = ejs.render(str, {
  names: ['foo', 'bar', 'baz']
});

=======

/**
 * Module dependencies.
 */

var ejs = require('../')
  , fs = require('fs')
  , str = fs.readFileSync(__dirname + '/list.ejs', 'utf8');

var ret = ejs.render(str, {
  names: ['foo', 'bar', 'baz']
});

>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
console.log(ret);