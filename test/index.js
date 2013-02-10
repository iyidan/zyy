var http   = require( 'http' );
var assert = require( 'assert' );
var test = 'test';

http.createServer(function ( req, res ) {
  res.writeHead( 200, { 'Content-Type': 'text/plain' } );
  res.end( 'Hello World.\n' );
}).listen( 3000, '127.0.0.1' );
