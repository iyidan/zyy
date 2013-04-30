var DB   = require('./index');
var Test = require('../test').Test;
var util = require('util');

var config = {
  DB: {
    'driver': 'redis',
  },
  PROJECT_NAME: 'test_redis_driver'
}

var db = new DB.DB(config);
var test = new Test();

test.test('console.log db', function(){
  console.log(db);
  test.next();
});

test.test('nstest set and get', function(){

  db.NS('nstest').set('key1', 'val1', function(err, result){
    db.NS('nstest').get('key1', function(err, result){
      console.log(err, result);
      test.next();
    });
  });

});

test.test('nstest keys *', function(){
  db.NS('nstest').keys('*', function(err, result){
    console.log(err, result);
    test.next();
  });   
});

test.test('nstest del key1',function(){

  db.NS('nstest').get('key1', function(err, result){
    console.log('get', err, result);
    db.NS('nstest').del('key1', function(err, result){
      console.log('del', err, result);
      test.next();
    });
  });
});

test.test('nstest eval', function(){
  var lua = "redis.pcall('hset', KEYS[1], ARGV[1], ARGV[2]);\nreturn redis.pcall('hgetall', KEYS[1]);";
  db.NS('nstest').eval(lua, 1, 'testhashkey', 'filed1', 'value1', function(err, result){
    console.log(err, result);
    test.next();
  });
});

test.test('nstest incr', function(){
  db.NS('nstest').incr('counter', function(err, result){
    console.log(err, result);
    db.NS('nstest').incr('counter', function(err, result){
      console.log(err, result);
      test.next();
    });
  });
});

// 执行测试
test.next();