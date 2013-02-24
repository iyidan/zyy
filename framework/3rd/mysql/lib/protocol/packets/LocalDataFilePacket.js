<<<<<<< HEAD
module.exports = LocalDataFilePacket;
function LocalDataFilePacket(data) {
  this.data = data;
}

LocalDataFilePacket.prototype.write = function(writer) {
  writer.writeString(this.data);
};
=======
module.exports = LocalDataFilePacket;
function LocalDataFilePacket(data) {
  this.data = data;
}

LocalDataFilePacket.prototype.write = function(writer) {
  writer.writeString(this.data);
};
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
