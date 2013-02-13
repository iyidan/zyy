var config = require( './config' ).config;
var server = require( config.FW_PATH );
var util   = require( 'util' );

var server = server.createServer( config , function( app ){
  app.sub( 'testEvent1', 'testEvent2', 'testEvent3', function( dataList ){
    console.log( dataList );
    app.write( util.inspect( app, true, null ) );
    app.write('<hr/><hr/>');
    app.pub('testevents.ready');
  });

  app.sub( 'Event1', 'Event2', 'Event3', function( dataList ){
    console.log( dataList );
    app.write( util.inspect( app, true, null ) );
    app.write('<hr/><hr/>');
    app.pub('events.ready');
  });

  app.pub('testEvent', 'world.');
  app.pub('testEvent1', 'data1');
  app.pub('testEvent2', 'data2');
  app.pub('testEvent2', 'data2.5');
  app.pub('testEvent3', 'data3');

  
  app.pub('Event1', 'ata1');
  app.pub('Event2', 'ata2');
  app.pub('Event2', 'ata2.5');
  app.pub('Event3', 'ata3'); 
  app.sub('testevents.ready', 'events.ready', function(){
    app.end('###################################');
  }); 
});