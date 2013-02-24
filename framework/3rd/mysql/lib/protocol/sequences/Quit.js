<<<<<<< HEAD
var Sequence = require('./Sequence');
var Util     = require('util');
var Packets  = require('../packets');

module.exports = Quit;
Util.inherits(Quit, Sequence);
function Quit(callback) {
  Sequence.call(this, callback);
}

Quit.prototype.start = function() {
  this.emit('packet', new Packets.ComQuitPacket);
};
=======
var Sequence = require('./Sequence');
var Util     = require('util');
var Packets  = require('../packets');

module.exports = Quit;
Util.inherits(Quit, Sequence);
function Quit(callback) {
  Sequence.call(this, callback);
}

Quit.prototype.start = function() {
  this.emit('packet', new Packets.ComQuitPacket);
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
