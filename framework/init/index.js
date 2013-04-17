/**
 * 初始化app
 */

///////////////////////////////////////////////////////////////////

/* native module */
var http         = require('http');
var url          = require('url' );
var crypto       = require('crypto');
var fs           = require('fs');

/* framework module */
var core           = require('../core');
var Message        = require('../message').Message;
var DB             = require('../db').DB;
var cache          = require('../cache');
var cookie         = require('../cookie');
var SessionManager = require('../session').SessionManager;
var utils          = require('../core/utils.js');
var parseBody      = require('../parseBody').parseBody;
var router         = require('../router');

/* 3rd  */
// 模板引擎
var template       = require('../3rd/arttemplate');

/* 模块全局变量 */
var session = null;
var db      = null;
var setup   = null;

///////////////////////////////////////////////////////////////////

/**
 * 对外公开方法
 * @param  {Object} config       项目配置
 * @param  {Function} errorHandler 错误处理函数
 *   错误处理函数包括两个参数：errorType, err
 *   errorHandler(errorType, err);
 *   errorHandler('app.error', err, app);
 * @return {Object} 返回一个http服务器
 */
exports.createServer = function ( config, errorHandler ) 
{    

  var port = config.PORT || 3000;
  var ip   = config.IP || '127.0.0.1';
  
  // 错误处理  
  if ( typeof errorHandler != 'function' ) {
    errorHandler = function(type, err){
      console.log(type+': ', err);
    };
  } 

  // 编码路由
  router.hardCode(config.MODULE_PATH);

  // db
  if ( config.DB ) {
    db = new DB(config);
    db.sub('error', function(message, err){
      errorHandler('db.error', err);
    }, true, false);
  }

  // session
  if ( config.SESSION ) {
    session = new SessionManager(config);
    session.sub('error', function(message, err){
      errorHandler('session.error', err);
    }, true, false);
  }

  // 模板引擎
  var templateConf = {
    isDebug  : config.ONDEV ? true : false,
    rootPath : config.ROOT_PATH,
    theme    : config.THEME ? config.THEME : 'default',
    cache    : config.ONDEV ? false : true
  };
  template.init(templateConf);
  template.sub('error', function(message, err){
    errorHandler('template.error', err);
  });

  // 项目自身setup
  setup = require(config.ROOT_PATH + '/helper/setup');

  return createServer(ip, port, config, errorHandler);
};


/**
 * 创建http服务
 */
function createServer(ip, port, config, errorHandler)
{
  var server = http.createServer(function(req, res) {
    
    var app = new Framework( req, res, config, errorHandler );
    
    init_SERVER( app );
    init_ROUTE( app );
    init_GET( app );
    init_POST( app );
    init_FILES( app );
    init_BODY( app );
    init_COOKIE( app );
    init_DB( app );
    init_CACHE( app );
    init_SESSION( app );
    
    // 分派路由
    app.sub('setup.ok', function(){
      router.dispatch(app);
    });

    // 调用项目setup
    app.sub('init.app.ready', function(message, data){
      if ( setup && typeof setup.init == 'function') {
        setup.init(app, function(err, data){
          app.pub('setup.ok');
        });
        return;
      }
      app.pub('setup.ok');
    });
  });
  
  server.listen(port, ip);
  
  server.on('error', function(err){
    errorHandler('server.error', err);
  });

  return server;
}

/**
 * 构造Request
 * @param {Object} req http请求对象由http.createServer 产生
 * @param {Object} res http响应对象由http.createServer 产生
 * @param {Object} config 项目配置项
 * @param {Function} errorHandler 错误处理
 */
function Framework ( req, res, config, errorHandler )
{
  // 项目配置
  this.config = config;
  this.errorHandler = errorHandler;
  // 引用原始响应请求
  this.req = req;
  this.res = res;

  // 全局工具
  this.utils  = utils;

  // 初始化变量
  this._GET     = {};
  this._POST    = {};
  this._COOKIE  = {};
  this._SESSION = {};
  this._SERVER  = {};
  this._FILES   = {};
  // 需要设置的cookie暂存变量
  this._setCookies = [];
  // 当请求体无法被解析时，原始的数据将存储在此处
  this._oriBody = null;
  // 响应是否结束，防止keep-alive连接多次触发res.end
  this.ended    = false;
  // 初始化路由访问
  this.routes   = {};
  // 渲染模板所用的数据
  this.assignValues = {};
  
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
    errorHandler('app.error', err, app);
  }, true, false);

  // 注册 req error
  this.req.on('error', function(err){
    errorHandler('app.error', err, app);
  });

  // 注册debug
  this.sub('init.get.ready', function(message, data){
    if ( app.GET('debug') && ( app.config.ONDEV || app.GET('powerby') === app.config.POWERBY ) ) {
      app.debug = true;
    } else {
      app.debug = false;
    }
  });

  // 注册ready事件
  this.sub(
    'init.post.ready',
    'init.session.ready',
    'init.db.ready',
    'init.cache.ready',
    'init.files.ready',
    'init.cookie.ready',
    'init.route.ready',
    function(message, data){
      app.pub('init.app.ready', data);
    }
  );
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
    val = utils.sign( val, this.config.COOKIE.secret );
  }

  // 设置cookie
  cookie.setCookie( this, key, val, opt );
};

/**
 * SESSION
 */
Framework.prototype.SESSION = function ( key, val ) {
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
 * @param {String} str 返回给请求的内容
 */
Framework.prototype.end = function(str){
  if (this.ended == true) {
    return;
  }
  this.ended = true;
  // writeSession
  var app  = this, args = arguments;
  session.writeClose(this, function(err){
    // writeCookie
    if ( app._setCookies && app._setCookies.length ) {
      app.setHeader('Set-Cookie', app._setCookies);
    }
    if ( !app.res.statusCode ) {
      app.setStatusCode(200);
    }
    // @todo content length and other headers
    if ( !app.SERVER('isAjax') ) {
      app.setHeader('Content-Type', 'text/html');
    }
    app.res.end.apply(app.res, args);
  });
};

/**
 * 赋值到模板
 */
Framework.prototype.assign  = function(name, value) {
  if ( !name || typeof name != 'string' ) {
    this.pub('error', 'app.assign value name is not a stirng type.');
    return;
  }
  this.assignValues[name] = value;
};

/**
 * 渲染模板
 * @param  {String} filename [description]
 * @param {String} controllerModule 模板所在module，默认当前路由的module，如果传递root，则渲染/template/下的模板
 */
Framework.prototype.display = function(filename, controllerModule) {
  
  var app  = this;
  // 404  ...
  if(parseInt(filename) == filename) {
    filename = app.config.ROOT_PATH + '/template/' + template.config.theme + '/' + filename + '.html';
    fs.readFile(filename, function(err, fileData){
      app.end(fileData);
    });
    return;
  }
  // template
  controllerModule = controllerModule ? controllerModule : app.routes.module;
  if ( controllerModule == 'root' ) {
    filename = app.config.ROOT_PATH + '/template/' + template.config.theme + '/' + filename;
  } else {
    filename = app.config.MODULE_PATH + '/' + controllerModule + '/template/' + template.config.theme + '/' + filename;
  }
  
  // 解析包含
  template.parseInclude(filename, function(err, content){
    if (err) {
      app.pub('error', err);
      return;
    }
    var html = template.render(content, app.assignValues);
    app.end(html);
  });
};

/**
 * redirect跳转
 * @param {String} url 需要跳转的地址
 * @param {Number} status 跳转状态码 默认302
 */
Framework.prototype.redirect = function(url, status) {
  url = url + '';
  if (!url) {
    this.pub('error', 'redirect url is empty.');
    return;
  }

  if (!status) status = 302;

  this.setStatusCode(status);
  this.setHeader('Location', url);
  this.end('');
};

/**
 * 根据请求类型响应不同的请求
 * @param  {String, Object, Array} msg 消息类型
 * 字符串：
 *   是ajax：返回json: {info:msg}
 *   非ajax：返回提示信息['notice', msg, 'history.back()']
 * 对象：
 *   是ajax：返回json对象
 *   非ajax：返回提示信息
 * 数组：
 *   是ajax：--
 *   非ajax，返回提示信息
 */
Framework.prototype.showMsg = function(msg) {
  
  if (this.SERVER('isAjax')) {
    if ( typeof msg == 'string' ) {
      this.end(JSON.stringify({ 'info': msg }));
      return;
    } else if ( typeof msg == 'object' ) {
      this.end(JSON.stringify( msg ));
      return;
    }
  } else {
    if ( typeof msg == 'string' ) {
      this.assign('type', 'notice');
      this.assign('message', msg);
      this.assign('redirect_url', '');
      this.display('msg.html', 'root');
      return;
    } else if ( msg instanceof Array && msg.length == 3 ) {
      this.assign('type', msg[0]);
      this.assign('message', msg[1]);
      this.assign('redirect_url', msg[2]);
      this.display('msg.html', 'root');
      return;
    }
  }

  this.end(JSON.stringify(msg));

};

/**
 * 通用获取公共函数库
 * @param {String} name 公共函数库名
 *   module的函数库：
 *     moduleName
 *   非module下的函数库
 *     helperName
 */
Framework.prototype.helper = function(name) {
  // 优先加载module
  var filename = this.config.MODULE_PATH + '/'+ name + '/helper/index.js';
  try {
    var helper = require(filename);
    return helper;
  } catch(e) {
    if (e.code == 'MODULE_NOT_FOUND') {
      filename = this.config.ROOT_PATH + '/helper/' + name + '.js';
      helper = require(filename);
      return helper;
    }
    this.pub('error', e);
  }
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
  if ( req.url.indexOf('?') == -1 ) {
    req.url = req.url.replace('&', '?');
  }
  // 解析 query 为 obj
  urlObj =  url.parse( req.url, true );
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

function init_ROUTE ( app )
{
  var status = router.parse(app);
  app.pub('init.route.ready');
}

/**
 * 设置GET
 */
function init_GET( app )
{
  app._GET = app.SERVER( 'url' ).query;
  app.pub('init.get.ready');
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
  if ( !session ) {
    app.pub('init.session.ready');
    return;
  }

  app.sub( 'init.cookie.ready', function(message, data){
    session.parseCookie(app, function(err, sessionData){
      if ( err ) {
        app.pub('error', err);
        return false;
      }
      app._SESSION   = sessionData.data || {};
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
  app.db = db;
  app.pub( 'init.db.ready' );
}

/**
 * init Cache
 */
function init_CACHE( app )
{
  app.pub( 'init.cache.ready' );
}