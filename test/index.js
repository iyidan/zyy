var config  = require( './config' ).config;
var server  = require( config.FW_PATH );
var util    = require( 'util' );
var utils   = require(config.FW_PATH + '/core/utils.js' );
var Message = require(config.FW_PATH + '/message').Message;

server.createServer( config , function( message, app ){
  app.writeHead(200, { 'Content-Type':'text/html' });

  app.write( 'rc4:\n' );
  app.write( utils.rc4('key12341234', 'test') );
  app.write('\n');
  app.write( utils.rc4( 'key12341234' , utils.rc4('key12341234', 'test')) );
  app.write('\n');

  app.write( 'uid:\n' );
  app.write( utils.uid() );
  app.write('\n');
  app.write( utils.uid() );
  app.write('\n');
  app.write( utils.uid() );
  app.write('\n');
  app.write( utils.uid() );
  app.write('\n');
  app.write( utils.uid() );
  app.write('\n');
  app.write('\n');
  app.write('\n');
  app.write('\n');

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
    app.write( util.inspect(app._message) );
    app.write( '\n\n\n\n\n' );
    // need sub ablove pub
    var messager = new Message(false, 10);
    messager.sub('test-messager', function(){
      app.end( util.inspect(messager) );
    });
    messager.pub('test-messager2')
    messager.sub('test-messager2', function(){
      app.write('no ...');
    });
    messager.sub('test-messager2-1', 'test-messager2-2', function(){
      app.write('multi-storePub=false:\n');
      app.write( util.inspect( messager ) );
    });

    messager.pub('test-messager2-2');
    messager.pub('test-messager2-1');
    messager.pub('test-messager');
  }); 
});