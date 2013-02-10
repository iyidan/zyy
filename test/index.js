var http   = require( 'http' );
var assert = require( 'assert' );

var server  = require( '../framework/server.js' );

server.createServer(3000, '127.0.0.1', function ( req, res ) {
  req = Request( req );
  res = Response( res );
  res.writeHead( 200, { 'Content-Type': 'text/plain' } );
  res.end( 'Hello World.\n' );
});
