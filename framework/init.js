/**
 * http连接建立后初始化请求响应对象
 */
var url     = require( 'url' );
var cookie  = require( './cookie.js' );
var session = require( './session.js' );

/**
 * 包装原始的req对象
 * @param  {Object} oriReq 原始的request
 * @return {Object} 包装后的request
 */
exports.init = function( req, res ){
  var app = new Framework( req, res );
  return app;
};

/**
 * 构造Request
 */
function Framework ( req, res )
{
  // 引用原始响应请求
  this.req = req;
  this.res = res;

  this._SERVER    = parse_SERVER( req );
  
  this._GET       = SERVER.url.query;
  this._POST      = parse_POST( req );

  this._FILES     = parse_FILES( req );

  this._COOKIE    = parse_COOKIE( req );
  this._SESSION   = parse_SESSION( req );

  //请求开始毫秒数
  try {
    this.startTime = req.socket.server._idleStart.getTime();  
  } catch( e ) {
    this.startTime = (new Date()).getTime();
  }
}

////////////////////////////////////////
// Framework.prototype start
////////////////////////////////////////

/**
 * SERVER 方法
 */
Framework.prototype.SERVER = function ( key ) {
  if ( !key || typeof key != 'string' ) {
    throw new TypeError( __filename + ' in [Method GET], param key is not a string.' );
  }
  return this._SERVER[key];
};

/**
 * 定义GET方法
 * @param {String} key 字段名，通常只有数字或字符串
 * @param {Mixed} def 默认值
 */
Framework.prototype.GET = function ( key, def ) {
  if ( !key || typeof key != 'string' ) {
    throw new TypeError( __filename + ' in [Method GET], param key is not a string.' );
  }
  // 默认
  if ( def === undefined ) {
    return this._GET[key];
  }
  // 没有值就是默认值
  var value = this._GET[key] || def;
  if ( value !== def ) {
    var typeDef = typeof def;
    switch ( typeDef ) {
      case 'number':
        value = (new Number(value)).valueOf();
        break;
      // 默认字符串
      default :
        value = '' + value;
    }
  }
  return value;
};

/**
 * 定义POST方法
 * @param {String} key 字段名，通常只有数字或字符串
 * @param {Mixed} def 默认值
 */
Framework.prototype.POST = function ( key, def ) {
  if ( !key || typeof key != 'string' ) {
    throw new TypeError( __filename + ' in [Method POST], param key is not a string.' );
  }
  // 默认
  if ( def === undefined ) {
    return this._POST[key];
  }
  // 没有值就是默认值
  var value = this._POST[key] || def;
  if ( value !== def ) {
    var typeDef = typeof def;
    switch ( typeDef ) {
      case 'number':
        value = (new Number(value)).valueOf();
        break;
      // 默认字符串
      default :
        value = '' + value;
    }
  }
  return value;
};

/**
 * REQUEST
 */
Framework.prototype.REQUEST = function( key, def ) {
  if ( !key || typeof key != 'string' ) {
    throw new TypeError( __filename + ' in [Method REQUEST], param key is not a string.' );
  }
  var getVal = this._GET[key];
  if ( getVal !== undefined ) {
    return this.GET( key, def );
  }
  return this.POST(key, def);
};

/**
 * COOKIE
 */
Framework.prototype.COOKIE = function( key ) {
  if ( !key || typeof key != 'string' ) {
    throw new TypeError( __filename + ' in [Method COOKIE], param key is not a string.' );
  }
  return this._COOKIE[key];
};

/**
 * SESSION
 */
Framework.prototype.SESSION = function ( key ) {
  if ( !key || typeof key != 'string' ) {
    throw new TypeError( __filename + ' in [Method SESSION], param key is not a string.' );
  }
  return this._SESSION[key];
};

/**
 * FILES
 */
Framework.prototype.FILES = function( name ) {
  if ( !name || typeof name != 'string' ) {
    throw new TypeError( __filename + ' in [Method FILES], param name is not a string.' );
  }
  return this._FILES[name];
};

////////////////////////////////////////
// Framework.prototype end
////////////////////////////////////////

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