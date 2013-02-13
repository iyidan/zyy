var config = require( './config' ).config;
var server = require( config.FW_PATH );
var util   = require( 'util' );

var server = server.createServer( config , function( app ){
  console.log( 'request in ' + app.SERVER('url').href );

  app.sub( 'testEvent', function( data ){
    console.log( 'testEvent\n' );
    app.COOKIE( 'test', 'test', 3600 );
    app.end( util.inspect( app ) );
  });

  app.pub('testEvent', 'world.');
});