var http = require( 'http' );
var util = require( 'util' );
/**
 * 创建一个http服务器
 */
exports.createServer = function ( port, ip, callback ) {
    if ( !port || !ip ) {
      throw new Error( __filename + 'createServer params is empty.' );
    }
    http.createServer(function( req, res ){
      req = inherits_req( req );
      res = inherits_res( res );
      console.log(req, res);
      callback(req, res);
    }).listen(port, ip);
};

/**
 * 包装最初的request
 * @param  {Object} oriReq 
 * @return {Object}        
 */
function inherits_req( oriReq ) {

  /*return Object.create( oriReq, {
    'ori': {
      value:oriReq
    }
  });*/
  return util.inherits({
    'ori':oriReq
  }, oriReq);
}

/**
 * 包装最初的response
 * @param  {Object} oriRes 
 * @return {Object}        
 */
function inherits_res ( oriRes ) {
  /*return Object.create( oriRes, {
    'ori': {
      value:oriRes
    }
  });*/
  return util.inherits({
    'ori':oriRes
  }, oriRes);
}