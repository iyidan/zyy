var http  = require( 'http' );
var init  = require( './init.js' ).init;
var core  = require('./core/index.js');

/**
 * 创建一个http服务器
 * @param {Number} port 监听端口
 * @param {String} ip 监听ip地址
 * @param {Function} callback  请求被初始化后调用的函数
 * @return {Object} 返回有http.createServer 生成的server实例
 */
exports.createServer = function ( port, ip, callback ) {
    var port = port || 3000;
    var ip   = ip || '127.0.0.1';
    return http.createServer(function(req, res){
      var app = init(req, res);
      callback( app );
    }).listen(port, ip);
};