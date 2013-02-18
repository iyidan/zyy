/**
 * session模块
 */
var fs      = require('fs');
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
  this.lifetime        = isNaN( config.lifetime ) ? 3600*24*30 : config.lifetime;
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
    throw Error( err );
  });

  // 储存器实例
  var Driver  = require( './driver/' + this.save_handler + '.js' )[this.save_handler];
  this.driver = new Driver;
  // 反引用
  this.driver._sm = this;

  // 检查配置
  this._check();
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
  this.driver.read(sessionid, callback);
};

/**
 * 写一个会话
 */
pro.write = function( sessionid, data, callback )
{
  this.driver.write(sessionid, data, callback);
};

/**
 * 销毁一个会话
 */
pro.destory = function( sessionid, callback ) {
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
  this.driver.renew(sessionid, callback);
};
