/**
 * http连接建立后集中初始化请求响应对象
 */

var Request  = require( './Request.js' ).Request;
var Response = require( './Response.js' ).Response;

/**
 * 包装原始的req对象
 * @param  {Object} oriReq 原始的request
 * @return {Object} 包装后的request
 */
exports.init = function( oriReq, oriRes ){
  var req = new Request( oriReq );
  var res = new Response( oriRes );
  return [req, res];
};