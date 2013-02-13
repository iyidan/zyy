var config = require( './config' ).config;
var server = require( config.FW_PATH );
var util   = require( 'util' );

var server = server.createServer( config , function( app ){
  app.sub( 'testEvent', function( data ){
    app.COOKIE( 'test', 'test', 3600, true );
    app.end( util.inspect( app ) );
  });
  app.pub('testEvent', 'world.');
});