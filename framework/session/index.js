/**
 * session模块
 */
var utils   = require('../core/utils.js');
var Message = require('../message').Message;

var session = module.exports;

/**
 * session 管理器
 * @param {Object} config 
 * @return {Object} 返回一个session实例
 */
session.SessionManager = function( config ) {

  this.save_handler    = config.save_handler || 'memory';
  this.save_path       = config.save_path || '/tmp/node_session';
  this.lifetime        = isNaN( config.lifetime ) ? 3600*24*30*1000 : config.lifetime*1000;

  this.cookie_param    = config.cookie_param || 'NODESESSIONID',
  this.cookie_path     = config.cookie_path || '/';
  this.cookie_domain   = config.cookie_domain || '';
  this.cookie_secure   = config.cookie_secure || false;
  this.cookie_httponly = config.cookie_httponly || false;
  
  this.gc_probability  = config.gc_probability || 0.1;

  // session manager
  var sm = this;

  // pub/sub 不储存触发过的事件
  new Message(false, 50, this);

  // sub error message
  this.sub( 'error', function(message, err){
    console.log(message, err);
    throw new Error( err );
  });

  // 储存器实例
  try {
    var Driver  = require( './driver/' + this.save_handler + '.js' )[this.save_handler];
    this.driver = new Driver;
    // 反引用
    this.driver._sm = this;

    // 检查配置
    this._check();
  } catch(e) {
    this.pub('error', e.toString());
  }
};

/**
 * sessionManagerPrototype
 */
var pro = session.SessionManager.prototype;

/////////////////////////////////////////////////////////////////////////////////
// 以下封装了各种环境下session储存、读写的操作方法：
// check()                                  检查是否配置正确
// open(Object config)                      定义了建立连接等操作
// close()                                  定义了会话完毕后的操作，断开连接等
// read(String sessionid)                   定义了读取一个会话数据的操作
// write(String sessionid, JSONString data) 写入数据
// destory(String sessionid)                销毁会话
// gc()                                     回收过期的session
/////////////////////////////////////////////////////////////////////////////////

/**
 * 检查配置
 */
pro._check = function() {
  // checkconfig
  this.driver.check();
};

/**
 * 打开session储存
 */
pro.open = function( callback ) {
  this.driver.open(callback);
};

/**
 * 关闭连接
 */
pro.close = function(callback) {
  this.driver.close(callback);
};

/**
 * 读取一个会话信息
 */
pro.read = function( sessionid, callback ) {
  sessionid = this._checkSessionId(sessionid);
  this.driver.read(sessionid, callback);
};

/**
 * 写一个会话
 */
pro.write = function( sessionid, data, callback )
{
  sessionid = this._checkSessionId(sessionid);
  this.driver.write(sessionid, data, callback);
};

/**
 * 销毁一个会话
 */
pro.destory = function( sessionid, callback ) {
  sessionid = this._checkSessionId(sessionid);
  this.driver.destory(sessionid, callback);
};

/**
 * gc
 */
pro.gc = function() {
  var random = Math.random();
  if ( random <= this.gc_probability ) {
    this.driver.gc();
  }
};

////////////////////////////////////////////////////
// 以上封装了各种环境下session储存、读写的操作方法：
////////////////////////////////////////////////////

/**
 * 创建一个空的session
 * @param  {Function} callback 创建成功后的回调函数
 */
pro.create = function(callback) {
  this.driver.create(callback);
};

/**
 * 刷新一个session会话的有效期
 * @param  {String} sessionid 
 * @param  {Function} callback
 */
pro.renew = function( sessionid, callback ) {
  sessionid = this._checkSessionId(sessionid);
  this.driver.renew(sessionid, callback);
};

/**
 * uid
 */
pro.uid = function() {
  return utils.md5( utils.uid(128) );
}

/**
 * 检查sessionid是否合法
 * @param  {String} sessionid 
 * @return {String|Boolean}
 */
pro._checkSessionId = function( sessionid ) {
  if ( !sessionid || typeof sessionid != 'string' ) {
    this.pub('error', 'sessionid is not a string type.');
  }
  sessionid = sessionid.trim();
  if ( sessionid ) {
    return sessionid;
  }
  this.pub('error', 'sessionid is empty.');
};

/**
 * 解析cookie中的会话
 * @param {Object} app 某次请求
 */
pro.parseCookie = function(app, callback) {
  callback = typeof callback == 'function' ? callback : function(){};
  var sessionid = app.COOKIE(this.cookie_param);
  console.log('sessionid-cookie', sessionid);
  // unsign sessionid
  if (sessionid) {
    var ua = app.SERVER('headers')['user-agent'] || 'none-user-agent';
    var key = utils.md5( __filename + app.config.PROJECT_NAME + ua);
    try {
      sessionid = utils.base64_decode(sessionid);
      sessionid = utils.rc4(key, sessionid);
    } catch(e) {
      sessionid = '';
    }  
  }
  console.log('sessionid-parsed', sessionid);
  // 创建一个会话 
  if (!sessionid) {
    this.create(callback);
    console.log('session create', sessionid);
  } else {
    // 更新会话
    this.renew(sessionid, callback);
  }
  return true;
};

/**
 * 设置cookie并保存session
 * @param {Object} app 某次请求
 */
pro.writeClose = function(app, callback) {
  callback = typeof callback == 'function' ? callback : function(){};
  var sessionData = app._SESSION;
  var sessionid   = app._sessionid;
  // error
  if ( typeof sessionData != 'object' || !sessionid ) {
    callback('app._SESSION is not an object or app._sessionid is empty in session write close.', false);
    return false;
  }
  // write
  var that = this;
  this.write(sessionid, sessionData, function(err, session){
    if (err) {
      callback(err, false);
      return false;
    }
    var ua = app.SERVER('headers')['user-agent'] || 'none-user-agent';
    var key = utils.md5( __filename + app.config.PROJECT_NAME + ua);
    sessionid = utils.rc4(key, sessionid);
    sessionid = utils.base64_encode(sessionid);
    app.COOKIE( 
      that.cookie_param, 
      sessionid, 
      session.expires, 
      false, 
      that.cookie_path, 
      that.cookie_domain, 
      that.cookie_secure, 
      that.cookie_httponly
    );
    callback(false, true);
  });
};