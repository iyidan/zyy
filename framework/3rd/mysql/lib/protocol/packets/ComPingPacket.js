<<<<<<< HEAD
module.exports = ComPingPacket;
function ComPingPacket(sql) {
  this.command = 0x0e;
}

ComPingPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
};

ComPingPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
};
=======
module.exports = ComPingPacket;
function ComPingPacket(sql) {
  this.command = 0x0e;
}

ComPingPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
};

ComPingPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
