<<<<<<< HEAD
module.exports = ComStatisticsPacket;
function ComStatisticsPacket(sql) {
  this.command = 0x09;
}

ComStatisticsPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
};

ComStatisticsPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
};
=======
module.exports = ComStatisticsPacket;
function ComStatisticsPacket(sql) {
  this.command = 0x09;
}

ComStatisticsPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
};

ComStatisticsPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
