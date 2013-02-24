<<<<<<< HEAD
module.exports = ComQuitPacket;
function ComQuitPacket(sql) {
}

ComQuitPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, 0x01);
};
=======
module.exports = ComQuitPacket;
function ComQuitPacket(sql) {
}

ComQuitPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, 0x01);
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
