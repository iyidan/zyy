var server = require( '../framework/index.js' );

server.createServer(3000, '127.0.0.1', function( app ){
  console.log( 'request in ' + app.SERVER('url').href );
  app.res.end( 'Hello World.\n' );
});