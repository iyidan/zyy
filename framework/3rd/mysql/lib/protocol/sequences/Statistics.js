<<<<<<< HEAD
var Sequence = require('./Sequence');
var Util     = require('util');
var Packets  = require('../packets');

module.exports = Statistics;
Util.inherits(Statistics, Sequence);
function Statistics(callback) {
  Sequence.call(this, callback);
}

Statistics.prototype.start = function() {
  this.emit('packet', new Packets.ComStatisticsPacket);
};

Statistics.prototype['StatisticsPacket'] = function (packet) {
  this.end(null, packet);
};

Statistics.prototype.determinePacket = function(firstByte, parser) {
  if (firstByte === 0x55) {
    return Packets.StatisticsPacket;
  }
};
=======
var Sequence = require('./Sequence');
var Util     = require('util');
var Packets  = require('../packets');

module.exports = Statistics;
Util.inherits(Statistics, Sequence);
function Statistics(callback) {
  Sequence.call(this, callback);
}

Statistics.prototype.start = function() {
  this.emit('packet', new Packets.ComStatisticsPacket);
};

Statistics.prototype['StatisticsPacket'] = function (packet) {
  this.end(null, packet);
};

Statistics.prototype.determinePacket = function(firstByte, parser) {
  if (firstByte === 0x55) {
    return Packets.StatisticsPacket;
  }
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
