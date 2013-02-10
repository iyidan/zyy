var server = require( '../framework/index.js' );

server.createServer(3000, '127.0.0.1', function(req, res){
  console.log( 'request in ' + req.SERVER.url.href );
  res.ori.end('hello');
});