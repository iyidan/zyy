var http = require( 'http' );
var util = require( 'util' );

http.createServer(function ( req, res ) {
  
  res.writeHead( 200, { 'Content-Type': 'text/plain' } );
  var startT = req.socket._idleStart.getTime();
  var endT   = (new Date()).getTime();
  //res.write( util.inspect( req ) );
  res.end( '\nHello World.\n' + ( endT - startT ) );
}).listen( 3000, '127.0.0.1' );