var cookie  = require( './cookie.js' );
var session = require( './session.js' );
var url     = require( 'url' );
var qs      = require( 'querystring' );


/**
 * 生成初始化后的request对象
 * @param {Object} req 原始的request
 * @return {Object} 
 */
exports.Request = function ( oriReq )
{
  // 保留初始request
  this.ori      = oriReq;

  this.SERVER   = _parse_SERVER( this );
  
  this.GET      = _parse_GET( this );
  this.POST     = _parse_POST( this );
  this.REQUEST  = _parse_REQUEST( this );

  this.FILES    = {};

  this.COOKIE   = cookie.parse(this);
  this.SESSION  = session.parse(this);
};

/**
 * 解析url
 */
function _parse_URL( req )
{
  var urlStr = req.ori.url;
  // 解析 query 为 obj
  urlObj =  url.parse( urlStr, true );
  return urlObj;
}

/**
 * 设置SERVER环境变量
 * @param {Object} req 由 Request构造产生的
 * request.headers
request.trailers
 */
function _parse_SERVER( req )
{
  var server = {
    'url'         : _parse_URL( req ),
    'httpVersion' : req.ori.httpVersion,
    'headers'     : req.ori.headers,
    'trailers'    : req.ori.trailers,
    'method'      : req.ori.method
  };

  return server;
}

/**
 * 解析Get
 */
function _parse_GET( req )
{
  return req.SERVER.url.query;
}

/**
 * 设置REQUEST 需要在解析GET和POST之后
 * @param {Object} req 由 Request构造产生的
 */
function _parse_REQUEST( req )
{
  return req.GET.merge(req.POST);
}