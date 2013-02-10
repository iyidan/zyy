var http   = require( 'http' );
var assert = require( 'assert' );
var util   = require( 'util' );

var server  = require( '../framework/server.js' );

server.createServer(3000, '127.0.0.1', function ( req, res ) {
  console.log(req);
  console.log('####################');
  console.log(res);
  res.writeHead( 200, { 'Content-Type': 'text/plain' } );
  res.end( 'Hello World.\n' );
});
