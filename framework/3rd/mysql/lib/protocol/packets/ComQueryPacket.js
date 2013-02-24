<<<<<<< HEAD
module.exports = ComQueryPacket;
function ComQueryPacket(sql) {
  this.command = 0x03;
  this.sql     = sql;
}

ComQueryPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
  writer.writeString(this.sql);
};

ComQueryPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
  this.sql     = parser.parsePacketTerminatedString();
};
=======
module.exports = ComQueryPacket;
function ComQueryPacket(sql) {
  this.command = 0x03;
  this.sql     = sql;
}

ComQueryPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
  writer.writeString(this.sql);
};

ComQueryPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
  this.sql     = parser.parsePacketTerminatedString();
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
