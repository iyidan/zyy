/**
 * app主入口文件
 */

var util = require('util');

test
test2
test3
test4
test5
test6
test7
var http = require('http');
var cookie = require('cookie');

http.createServer(function(req, res){
  try {
    cookie.parseCookie(req);
    //cookie.parseRememberMe(req, res, function(req, res){
    // 

// test
    //});
    cookie.setCookie();
    console.log(req.headers);
    res.end(util.inspect(req.headers, null ,true));
  } catch (e) { }
    
  
}).listen(1337);
