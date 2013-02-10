var http = require( 'http' );

/**
 * 创建一个http服务器
 */
exports.createServer = function ( port, ip, callback ) {
    if ( !port || !ip ) {
      throw new Error( __filename + 'createServer params is empty.' );
    }
    http.createServer(function( req, res ){
      req = Object.create( req, {
        'ori':req
      });
      res = Object.create( res, {
        'ori':res
      });
      callback(req, res);
    }).listen(port, ip);
};