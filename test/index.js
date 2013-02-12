var config = require( './config' ).config;
var server = require( config.FW_PATH );
var util   = require( 'util' );

var server = server.createServer( config , function( app ){
  console.log( 'request in ' + app.SERVER('url').href );
  app.res.writeHead(200, { 'Contet-type': 'text/plain' });

  app.sub( 'testEvent', function( data ){
    console.log( 'testEvent\n' );
    app.res.write( data );
    app.res.end( util.inspect( app, true, null ) );
  });

  app.res.write( 'hello\n' );
  app.pub('testEvent', 'world.');
});