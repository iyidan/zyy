var url     = require( 'url' );
var cookie  = require( './cookie.js' );
var session = require( './session.js' );

/**
 * 生成初始化后的request对象
 * @param {Object} req 原始的request
 * @return {Object} 
 */
exports.Request = function ( oriReq )
{
  // 保留初始request
  this.ori      = oriReq;

  this.SERVER   = parse_SERVER( this );
  
  this.GET      = parse_GET( this );
  this.POST     = parse_POST( this );
  this.REQUEST  = parse_REQUEST( this );

  this.FILES    = parse_FILES( this );

  this.COOKIE   = parse_COOKIE( this );
  this.SESSION  = parse_SESSION( this );
};

/**
 * 解析url
 * @param {Object} req 由 Request构造产生的
 */
function parse_URL( req )
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
function parse_SERVER( req )
{
  var server = {
    'url'         : parse_URL( req ),
    'httpVersion' : req.ori.httpVersion,
    'headers'     : req.ori.headers,
    'trailers'    : req.ori.trailers,
    'method'      : req.ori.method
  };

  return server;
}

/**
 * 解析Get，需要在parse_SERVER 后调用
 * @param {Object} req 由 Request构造产生的
 */
function parse_GET( req )
{
  return req.SERVER.url.query;
}

/**
 * 解析POST数据
 * @param {Object} req 由 Request构造产生的
 */
function parse_POST( req )
{
  var post = {};
  // @todo
  return post;
}

/**
 * 设置REQUEST 需要在解析GET和POST之后
 * @param {Object} req 由 Request构造产生的
 */
function parse_REQUEST( req )
{
  return req.GET.merge(req.POST);
}

/**
 * 解析files
 * @param {Object} req 由 Request构造产生的
 */
function parse_FILES( req )
{
  var files = {};
  // @todo
  return files;
}

/**
 * 解析cookie
 * @param {Object} req 由 Request构造产生的
 */
function parse_COOKIE( req )
{
  var cookie = {};
  // @todo
  return cookie;
}

/**
 * 解析session
 * @param {Object} req 由 Request构造产生的
 */
function parse_SESSION( req )
{
  var session = {};
  // @todo
  return session;
}
