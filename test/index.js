var server = require( '../framework/index.js' );

server.createServer(3000, '127.0.0.1', function(req, res){
  console.log( 'request in ' + req.SERVER.url.href );
  res.ori.writeHead( 200, { 'Content-Type': 'text/plain' } );
  var startT = req.socket._idleStart.getTime();
  var endT   = (new Date()).getTime();
  res.ori.end( '\nHello World.\n' + (startT - endT) );
});