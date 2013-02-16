/**
 * test pub/sub module
 */
var assert  = require('assert');
var test    = require('../test');
var Message = require('./index.js').Message;

// 基本测试
test.suite('basic');

test.test('default', function(){
  
  console.log('sub default: subPublished & subOnce\n');
  console.log('new Message default: storePub & listeners limitNum is 50\n');
  
  var messager = new Message();
  
  messager.sub('testMessage', function(message, data){
    assert.deepEqual('pub1', data);
    console.log('[1]sub before pub ok, sub isOnce=true ok.');
  });
  
  messager.pub('testMessage', 'pub1');
  messager.pub('testMessage', 'pub2');
  
  // subPublished = true
  messager.sub('testMessage', function(message, data){
    assert.deepEqual('pub2', data);
    console.log('sub after pub ok.');
  });

  // subPublished = false
  messager.sub( 'testMessage', function(message, data){
    assert.deepEqual('pub3', data);
    console.log('sub with subPublished=false ok.');
  }, false );

  messager.pub('testMessage', 'pub3');

  // isOnce = false
  messager.sub('testMessage', function(message, data){
    console.log('[*]sub not only once:', message, data);
  }, false, false);

  messager.pub('testMessage', 'pub4');
  messager.pub('testMessage', 'pub5');
  messager.pub('testMessage', 'pub6');

  console.log( 'messager: ', messager);

  var messager2 = new Message();
  for ( var i = 0; i < 50; i ++ ) {
    messager2.sub('testMessage', function(message, data){
      console.log( 'messager2.sub' + i);
    }, true, false);
  }
  messager2.sub('testMessage', function(message, data){
    console.log('messager2.sub51');
  }, true, false);

  messager2.pub('testMessage', 'testMessager2');

  var app = {}；
  new Message( false, 10, app);
  app.pub('testMessage', 'pub1');
  app.sub('testMessage', function(message, data){
    assert.deepEqual('pub2', data);
  });

  app.pub('testMessage', 'pub2');
  console.log('app._message:', app._message);
});


test.suite('multi');
test.test('multiSubMessages', function(){

  var messager = new Message();

  messager.sub('test1', 'test2', 'test3', function(message, data){
    assert.deepEqual('pub1', data[0]);
    assert.deepEqual('pub2', data[1]);
    assert.deepEqual('pub3', data[2]);
    console.log('multi sub before ok.');
  });

  messager.pub('test2', 'pub2');
  messager.pub('test1', 'pub1');
  messager.pub('test3', 'pub3');

  messager.sub('test1', 'test2', 'test3', function(message, data){
    assert.deepEqual('pub1', data[0]);
    assert.deepEqual('pub2', data[1]);
    assert.deepEqual('pub3', data[2]);
    console.log('multi sub after ok.');
  });

  // subPublished= false
  messager.sub('test1', 'test2', 'test3', function(message, data){
    assert.deepEqual('pub11', data[0]);
    assert.deepEqual('pub22', data[1]);
    assert.deepEqual('pub33', data[2]);
    console.log('multi sub before ok.');
  }, false);
  messager.pub('test2', 'pub22');
  messager.pub('test1', 'pub11');
  messager.pub('test3', 'pub33');

  // isOnce = false
  messager.sub('test1', 'test2', 'test3', function(message, data){
    console.log('[4 times]multi sub isOnce=false ok.');
  }, true, false);

  messager.pub('test2', 'pub222');
  messager.pub('test1', 'pub111');
  messager.pub('test3', 'pub333');

  messager.pub('test3', 'pub3333');
  messager.pub('test2', 'pub2222');
  messager.pub('test1', 'pub1111');

  messager.pub('test3', 'pub33333');
  messager.pub('test2', 'pub22222');
  messager.pub('test1', 'pub11111');
});
