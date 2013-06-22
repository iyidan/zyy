var redis = require("/data/zyy/framework/3rd/redis"),
    client = redis.createClient();

client.set('incrtest1', '9007199254740992', function(err, result){
  console.log(1,err, result);
  client.incr('incrtest1', function(err, result){
    console.log(1,err, result);
    client.get('incrtest1', function(err, result){
      console.log(1,err, result);
    });
  });
});

client.set('incrtest2', '900719925474099', function(err, result){
  console.log(2,err, result);
  client.incr('incrtest2', function(err, result){
    console.log(2,err, result);
    client.get('incrtest2', function(err, result){
      console.log(2,err, result);
    });
  });
});

client.set('incrtest3', '90071992547409', function(err, result){
  console.log(3,err, result);
  client.incr('incrtest3', function(err, result){
    console.log(3,err, result);
    client.get('incrtest3', function(err, result){
      console.log(3,err, result);
    });
  });
});
