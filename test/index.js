var config = require( './config' ).config;
var server = require( config.FW_PATH );
var util   = require( 'util' );

var server = server.createServer( config , function( app ){
  app.sub( 'testEvent1', 'testEvent2', 'testEvent3' function( dataList ){
    app.end( util.inspect( dataList ) );
  });

  app.pub('testEvent', 'world.');
  app.pub('testEvent1', 'data1');
  app.pub('testEvent2', 'data2');
  app.pub('testEvent3', 'data3');
});