var server = require( '../framework/server.js' );

server.createServer(3000, '127.0.0.1', function(req, res){
  console.log( 'request in ' + req.SERVER.url.href );
});