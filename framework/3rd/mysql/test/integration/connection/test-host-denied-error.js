<<<<<<< HEAD
var common     = require('../../common');
var connection = common.createConnection({port: common.fakeServerPort});
var assert     = require('assert');

var server = common.createFakeServer();

var connectErr;
server.listen(common.fakeServerPort, function(err) {
  if (err) throw err;

  connection.connect(function(err) {
    connectErr = err;
    server.destroy();
  });
});

server.on('connection', function(incomingConnection) {
  var errno = 1130; // ER_HOST_NOT_PRIVILEGED
  incomingConnection.deny('You suck.', errno);
});

process.on('exit', function() {
  assert.equal(connectErr.code, 'ER_HOST_NOT_PRIVILEGED');
  assert.ok(/You suck/.test(connectErr.message));
  assert.equal(connectErr.fatal, true);
});
=======
var common     = require('../../common');
var connection = common.createConnection({port: common.fakeServerPort});
var assert     = require('assert');

var server = common.createFakeServer();

var connectErr;
server.listen(common.fakeServerPort, function(err) {
  if (err) throw err;

  connection.connect(function(err) {
    connectErr = err;
    server.destroy();
  });
});

server.on('connection', function(incomingConnection) {
  var errno = 1130; // ER_HOST_NOT_PRIVILEGED
  incomingConnection.deny('You suck.', errno);
});

process.on('exit', function() {
  assert.equal(connectErr.code, 'ER_HOST_NOT_PRIVILEGED');
  assert.ok(/You suck/.test(connectErr.message));
  assert.equal(connectErr.fatal, true);
});
>>>>>>> 7af941ee074ba19b0302249f5332e62ee930056a
