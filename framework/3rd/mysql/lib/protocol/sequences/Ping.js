<<<<<<< HEAD
var Sequence = require('./Sequence');
var Util     = require('util');
var Packets  = require('../packets');

module.exports = Ping;
Util.inherits(Ping, Sequence);

function Ping(callback) {
  Sequence.call(this, callback);
}

Ping.prototype.start = function() {
  this.emit('packet', new Packets.ComPingPacket);
};
=======
var Sequence = require('./Sequence');
var Util     = require('util');
var Packets  = require('../packets');

module.exports = Ping;
Util.inherits(Ping, Sequence);

function Ping(callback) {
  Sequence.call(this, callback);
}

Ping.prototype.start = function() {
  this.emit('packet', new Packets.ComPingPacket);
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
