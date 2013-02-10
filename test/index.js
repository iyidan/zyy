var http   = require( 'http' );
var assert = require( 'assert' );

var Request  = require( '../framework/Request.js' );
var Response = require( '../framework/Response.js' );

http.createServer(function ( req, res ) {
  req = Request( req );
  res = Response( res );
  res.writeHead( 200, { 'Content-Type': 'text/plain' } );
  res.end( 'Hello World.\n' );
}).listen( 3000, '127.0.0.1' );
