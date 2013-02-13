var config = require( './config' ).config;
var server = require( config.FW_PATH );
var util   = require( 'util' );

var server = server.createServer( config , function( app ){
  console.log( 'request in ' + app.SERVER('url').href );
  app.writeHead(200, { 'Contet-type': 'text/plain' });

  app.sub( 'testEvent', function( data ){
    console.log( 'testEvent\n' );
    app.write( data );
    app.end( util.inspect( app ) );
  });

  app.write( 'hello\n' );
  app.pub('testEvent', 'world.');
});