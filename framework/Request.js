var cookie  = require('./cookie.js');
var session = require('./session.js');


/**
 * 生成初始化后的request对象
 * @param {Object} req 原始的request
 * @return {Object} 
 */
exports.Request = function ( oriReq )
{
  this.ori      = oriReq;
  this.COOKIE   = {};
  this.SESSION  = {};
  this.GET      = {};
  this.REQUEST  = {};
  this.FILES    = {};
  this.SERVER   = _parse_SERVER(this);
};

/**
 * 设置SERVER环境变量
 * @param {Object} req 由 Request构造产生的
 * request.headers
request.trailers
 */
function _parse_SERVER( req )
{
  var server = {
    'url'         : req.ori.url,
    'httpVersion' : req.ori.httpVersion,
    'headers'     : req.ori.headers,
    'trailers'    : req.ori.trailers,
    'method'      : req.ori.method
  };

  req.SERVER = server;
}

/**
 * 设置REQUEST 需要在解析GET和POST之后
 * @param {Object} req 由 Request构造产生的
 */
function _parse_REQUEST( req )
{

}
