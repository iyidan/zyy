var DB   = require('./index');
var test = require('../test');
var util = require('util');

var config = {
  DB: {
    'driver': 'redis',
  },
  PROJECT_NAME: 'test_redis_driver'
}

var db = new DB.DB(config);

test.suite('db details');

test.test('console.log db', function(){
  console.log(db);
});


test.suite('test NS');

test.test('set:', function(){
  db.NS('NSTEST').set('key1', 'val1', function(err, result){
    console.log(util.inspect(err), util.inspect(result));
    //test.next();
  });
});