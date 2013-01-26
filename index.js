/**
 * app主入口文件
 */

var util = require('util');

var http = require('http');
var cookie = require('cookie');

http.createServer(function(req, res){
  try {
    cookie.parseCookie(req);
    //cookie.parseRememberMe(req, res, function(req, res){
    // 
    //});
    cookie.setCookie();
    console.log(req.headers);
    res.end(util.inspect(req.headers, null ,true));
  } catch (e) { }
    
  
}).listen(1337);