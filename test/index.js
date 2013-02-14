var config = require( './config' ).config;
var server = require( config.FW_PATH );
var util   = require( 'util' );

var server = server.createServer( config , function( message, app ){
  app.writeHead(200, { 'Content-Type':'text/html' });
  app.sub( 'testEvent1', 'testEvent2', 'testEvent3', function( message, dataList ){
    app.write('sub1:\n');
    app.write( util.inspect( dataList ) );
    app.write('\n\n\n');
    //app.pub('testevents.ready');
  }, false);

  app.sub( 'testEvent1', 'testEvent2', 'testEvent3', function( message, dataList ){
    app.write('sub2:\n');
    app.write( util.inspect( dataList ) );
    app.write('\n\n\n');
    app.pub('testevents.ready');
  });

  app.sub( 'Event1', 'Event2', 'Event3', function( message, dataList ){
    app.write('sub3:\n');
    app.write( util.inspect( dataList ) );
    app.write('\n\n\n');
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

  app.sub( 'testEvent1', 'testEvent2', 'testEvent3', function( message, dataList ){
    app.write('sub2:\n');
    app.write( util.inspect( dataList ) );
    app.write('\n\n\n');
    app.pub('testevents.ready');
  });

  app.sub('testevents.ready', 'events.ready', function(){
    app.end( util.inspect(app) );
  }); 
});