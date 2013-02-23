/**
 * 初始化app
 */

///////////////////////////////////////////////////////////////////

/* native module */
var http         = require( 'http' );
var url          = require( 'url' );
var crypto       = require('crypto');
var util         = require( 'util' );

/* framework module */
var core           = require('../core');
var Message        = require('../message').Message;
var db             = require('../db');
var cache          = require('../cache');
var cookie         = require('../cookie');
var SessionManager = require('../session').SessionManager;
var utils          = require('../core/utils.js');
var parseBody      = require('../parseBody').parseBody;

/* 模块全局变量 */
var session = null;

///////////////////////////////////////////////////////////////////

exports.createServer = function ( config, callback ) {
    
    var port = config.PORT || 3000;
    var ip   = config.IP || '127.0.0.1';
    callback = typeof callback == 'function' ? callback : function(){};
    // session
    session = new SessionManager(config.SESSION);

    return http.createServer(function(req, res) {
      // new app
      var app = new Framework( req, res, config );
      // 开始初始化
      init_SERVER( app );
      init_GET( app );
      init_POST( app );
      init_FILES( app );
      init_BODY( app );
      init_COOKIE( app );
      init_DB( app );
      init_CACHE( app );
      init_SESSION( app );
      // callback
      app.sub('init.app.ready', function(message, data){
        callback(message, app);
      });
    }).listen(port, ip);
};

/**
 * 构造Request
 * @param {Object} req http请求对象由http.createServer 产生
 * @param {Object} res http响应对象由http.createServer 产生
 * @param {Object} config 项目配置项
 */
function Framework ( req, res, config )
{
  // 项目配置
  this.config = config;
  // 引用原始响应请求
  this.req = req;
  this.res = res;
  // 初始化变量
  this._GET     = {};
  this._POST    = {};
  this._COOKIE  = {};
  this._SESSION = {};
  this._SERVER  = {};
  this._FILES   = {};
  this._setCookies = [];
  this._oriBody = null;
  //请求开始毫秒数
  try {
    this.startTime = req.socket.server._idleStart.getTime();  
  } catch( e ) {
    this.startTime = (new Date()).getTime();
  }

  // pub&sub
  new Message(true, 50, this);
  var app = this;
  // 注册app error
  this.sub( 'error', function( message, err ){
    if ( app.config.ONDEV ) {
      app.setStatusCode(200);
      app.end( 'server error: ' + util.inspect( err, true ) );
    } else {
      app.setStatusCode(500);
      app.end('server error.');
    }
  }, true, false);
  // 注册 req error
  this.req.on('error', function(err){
    if ( app.config.ONDEV ) {
      app.setStatusCode(200);
      app.end( 'request error: ' + util.inspect( err, true ) );
    } else {
      app.setStatusCode(200);
      app.end('request error.');
    }
  });
  // 注册close事件
  this.res.on( 'close', function(){
    app.setStatusCode(500);
    app.end('request was closed');
  });
  // 注册ready事件
  this.sub(
    'init.post.ready',
    'init.session.ready',
    'init.db.ready',
    'init.cache.ready',
    'init.files.ready',
    'init.cookie.ready',
    function(messageId, data){
      app.pub('init.app.ready', data);
    }
  );
  // 注册end事件
  app.sub('response.ready', function(){

  });
}

////////////////////////////////////////
// Framework.prototype start
////////////////////////////////////////

/**
 * SERVER 方法
 */
Framework.prototype.SERVER = function ( key ) {
  return this._SERVER[key];
};

/**
 * 定义GET方法
 * @param {String} key 字段名，通常只有数字或字符串
 * @param {Mixed} def 默认值
 */
Framework.prototype.GET = function ( key, def ) {
  if ( !key || typeof key != 'string' ) return undefined;
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
  if ( !key || typeof key != 'string' ) return undefined;
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
  if ( !key || typeof key != 'string' ) return undefined;
  var getVal = this._GET[key];
  if ( getVal !== undefined ) {
    return this.GET( key, def );
  }
  return this.POST(key, def);
};

/**
 * COOKIE
 * 如果有val，则设置cookie
 * @param {String}  key cookie的键
 * @param {String}  val 要设置的值
 * @param {Number}  expires 过期时间，单位秒(s)，不设置则为配置中的过期时间
 * @param {Boolean} needSign 是否需要加密验证，默认不加密
 * @param {String} path cookie有效域，默认配置中的域
 * @param {String} domain cookie有效文档域
 * @param {Boolean} secure 是否是安全（https）下的cookie，默认false
 * @param {Boolean} httpOnly 是否仅在http下有效 默认false
 */
Framework.prototype.COOKIE = function( key, val, expires, needSign, path, domain, secure, httpOnly) {
  if ( !key || typeof key != 'string' ) return undefined;
  if ( val === undefined ) {
    return this._COOKIE[key];
  }

  var opt = {};
  opt.expires  = expires !== undefined ? expires : this.config.COOKIE.expires;
  opt.path     = path || this.config.COOKIE.path;
  opt.domain   = domain || '';
  opt.secure   = secure || false;
  opt.httpOnly = httpOnly || false;

  if ( needSign ) {
    val = this.COOKIE.sign( val, this.config.COOKIE.secret );
  }

  // 设置cookie
  cookie.setCookie( this, key, val, opt );
};

/**
 * 生成cookie加密值字符串，防止被篡改
 * @param {String} val 需要加密的字符串
 * @param {String} secret 密钥
 * @return {String} 
 */
Framework.prototype.COOKIE.sign = function( val, secretKey ) {
  return val + '.' + crypto
    .createHmac('sha256', secretKey)
    .update(val)
    .digest('base64')
    .replace(/\=+$/, '');
};

/**
 * 反解cookie加密后的值
 * @param {String} val 需要加密的字符串
 * @param {String} secret 密钥
 * @return {Boolean|String} 如果没被篡改，返回值否则返回false
 */
Framework.prototype.COOKIE.unsign = function( val, secretKey ) {
  var str = val.slice(0, val.lastIndexOf('.'));
  return this.sign(str, secretKey) === val ? str : false;
};

/**
 * SESSION
 */
Framework.prototype.SESSION = function ( key, val, expires ) {
  if ( !key || typeof key != 'string' ) return undefined;
  if ( val === undefined ) {
    return this._SESSION[key];
  }
  this._SESSION[key] = val;
  return true;
};

/**
 * FILES
 */
Framework.prototype.FILES = function( name ) {
  if ( !key ) return undefined;
  return this._FILES[name];
};

/**
 * response method
 * writeContinue
 */
Framework.prototype.writeContinue = function(){
  this.res.writeContinue.apply(this.res, arguments);
};

/**
 * response method
 * writeHead
 */
Framework.prototype.writeHead = function(){
  this.res.writeHead.apply(this.res, arguments);
};

/**
 * response method
 * setStatusCode
 */
Framework.prototype.setStatusCode = function( code ){
  if ( isNaN(code) ) {
    this.pub( 'error', {
      'file': __filename,
      'err': 'statusCode is not a number.'
    });
  } else {
    this.res.statusCode = code;  
  }
};

/**
 * 获取响应状态码
 */
Framework.prototype.getStatusCode = function() {
  return this.res.statusCode;
};

/**
 * response method
 * setHeader
 */
Framework.prototype.setHeader = function(){
  this.res.setHeader.apply(this.res, arguments);
};



/**
 * response method
 * getHeader
 */
Framework.prototype.getHeader = function(){
  this.res.getHeader.apply(this.res, arguments);
};

/**
 * response method
 * removeHeader
 */
Framework.prototype.removeHeader = function(){
  this.res.removeHeader.apply(this.res, arguments);
};

/**
 * response method
 * write
 */
Framework.prototype.write = function(){
  this.res.write.apply(this.res, arguments);
};

/**
 * response method
 * addTrailers
 */
Framework.prototype.addTrailers = function(){
  this.res.addTrailers.apply(this.res, arguments);
};

/**
 * response method
 * end
 */
Framework.prototype.end = function(){
  // writeSession
  var app  = this;
  var args = arguments;
  session.writeClose(this, function(){
    // writeCookie
    if ( app._setCookies && app._setCookies.length ) {
      app.res.setHeader('Set-Cookie', app._setCookies);
    }
    if ( !app.res.statusCode ) {
      app.setStatusCode(200);
    }
    app.res.end.apply(app.res, args);
  });
};

////////////////////////////////////////
// Framework.prototype end
////////////////////////////////////////

/**
 * 解析url
 * @param {Object} req 由 Request构造产生的
 */
function init_URL( req )
{
  var urlStr = req.url;
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
function init_SERVER( app )
{
  app._SERVER = {
    'url'         : init_URL( app.req ),
    'httpVersion' : app.req.httpVersion,
    'headers'     : app.req.headers,
    'trailers'    : app.req.trailers,
    'method'      : app.req.method,
    'userAgent'   : app.req.headers['user-agent'] || 'none',
    'ip'          : ( app.req.headers['x-real-ip'] || app.req.headers['x-forwarded-for'] ) || app.req.connection.remoteAddress,
    'referer'     : app.req.headers['referer'],
    'isAjax'      : (app.req.headers['x-requested-with'] || '' ).toLowerCase() == 'xmlhttprequest' ? true : false
  };
}

/**
 * 设置GET
 */
function init_GET( app )
{
  app._GET = app.SERVER( 'url' ).query;
}

/**
 * 解析请求体数据
 * @param {Object} req 由 Request构造产生的
 */
function init_BODY( app )
{
  parseBody(app);
  return true;
}

/**
 * 解析post
 */
function init_POST( app ) {
  app.sub( 'app.body.parse.ready', function( message, data ){
    app._POST = data ? data.fields : {};
    app.pub( 'init.post.ready' );
  });
}

/**
 * 解析files
 * @param {Object} req 由 Request构造产生的
 */
function init_FILES( app )
{
  app.sub( 'app.body.parse.ready', function( message, data ){
    app._FILES = data ? data.files : {};
    app.pub( 'init.files.ready' );
  });
}

/**
 * 解析cookie
 * @param {Object} req 由 Request构造产生的
 */
function init_COOKIE( app )
{
  // 解析cookie
  cookie.parse(app);
  // 是否解析post中的数据
  if ( !app.config.COOKIE.post_prefix || app.SERVER('method') != 'POST') {
    app.pub( 'init.cookie.ready' );
  } else {
    var prefix = app.config.COOKIE.post_prefix;
    app.sub( 'init.post.ready', function(){
      for ( var i in app._POST ) {
        if ( i.indexOf( prefix ) != -1 ) {
          app._COOKIE[i] = app._POST[i].trim();
        }
      }
      app.pub( 'init.cookie.ready' );
    });
  }
}

/**
 * 解析session
 * @param {Object} req 由 Request构造产生的
 */
function init_SESSION( app )
{
  // session 依赖于cookie
  app.sub( 'init.cookie.ready', function(message, data){
    session.parseCookie(app, function(err, sessionData){
      if ( err ) {
        app.pub('error', err);
        return false;
      }
      app._SESSION   = sessionData.data;
      app._sessionid = sessionData.sessionid;
      app.pub('init.session.ready');
    });  
  });
  
}

/**
 * init DB
 */
function init_DB( app )
{
  app.pub( 'init.db.ready' );
}

/**
 * init Cache
 */
function init_CACHE( app )
{
  app.pub( 'init.cache.ready' );
}