var http  = require( 'http' );
var init  = require( './init' ).init;

/**
 * 创建一个http服务器
 * @param {Number} port 监听端口
 * @param {String} ip 监听ip地址
 * @param {Function} callback  请求被初始化后调用的函数
 * @return {Object} 返回有http.createServer 生成的server实例
 */
exports.createServer = function ( config, callback ) {
    var port = config.PORT || 3000;
    var ip   = config.IP || '127.0.0.1';
    return http.createServer(function(req, res){
      init(req, res, callback);
    }).listen(port, ip);
};