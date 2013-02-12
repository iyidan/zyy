var server = require( '../framework/index.js' );
var util   = require( 'util' );

server.createServer(3000, '127.0.0.1', function( app ){
  console.log( 'request in ' + app.SERVER('url').href );
  app.res.writeHead(200, { 'Contet-type': 'text/plain' });

  app.sub( 'testEvent', function( data ){
    console.log( 'testEvent\n' );
    app.res.write( data );
    app.res.end( util.inspect( app ) );
  });
  
  app.res.write( 'hello\n' );
  app.pub('testEvent', 'world.');
});