<<<<<<< HEAD
var options = {};

if (process.env.FILTER) {
  options.include = new RegExp(process.env.FILTER + '.*\\.js$');
}

require('urun')(__dirname, options);
=======
var options = {};

if (process.env.FILTER) {
  options.include = new RegExp(process.env.FILTER + '.*\\.js$');
}

require('urun')(__dirname, options);
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
