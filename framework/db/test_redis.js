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

// 执行测试
test.next();