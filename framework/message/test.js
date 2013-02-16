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
});

