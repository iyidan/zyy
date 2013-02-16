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
  this.gc_probability  = config.gc_probability || (1/100);

  // session manager
  var sm = this;

  // pub/sub 不储存触发过的事件
  new Message(false, 50, this);

  // sub error message
  this.sub( 'error', function(message, err){
    throw new Error( err );
  });

  // 检查环境ok
  this.sub( 'checkOk', function(message, data){
    
  }, false, false);

  // 连接存储器ok
  this.sub( 'opend', function(message, data){

  }, false, false);

  // 关闭存储器ok
  this.sub('closed', function(message, data){

  }, false, false);

  // 读取sessionOk
  this.sub( 'readOk', function(message, data){
    
  }, false, false);

  // 写sessionOk
  this.sub( 'writeOk', function(message, data){

  }, false, false);

  // 销毁sessionOk
  this.sub( 'destoryOk', function( message, data ){

  }, false, false);

  // 储存器驱动实例
  this.driver = require( './driver/' + this.save_handler + '.js' );

  // 检查配置
  this.check();
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
pro.check = function(callback) {

  this.driver.check( this );

  // check save path 由于是在项目启动时候执行，可以不用异步操作
  if ( this.save_handler == 'files' ) {
    try {
      this.save_path = utils.rtrim(this.save_path, '/');
      if (!fs.existsSync(this.save_path)) {
        fs.mkdirSync(this.save_path, '0777');
      }
      else{
        fs.appendFileSync(this.save_path + '/' + utils.uid(), (new Date).toString());
      }
    } catch(err) {
      this.pub( 'error', 'session_save_path is not writeable ' + err.toString() );
      return;  
    }
  }
  // memcache
  else if ( this.save_handler == 'memcache' ) {

  }
  // redis
  else if ( this.save_handler == 'redis' ) {

  }
  // mysql
  else if ( this.save_handler == 'mysql' ) {

  }
  // 内存，每次项目重启或意外退出均会丢失session
  else if ( this.save_handler == 'memory' ) {
    console.log('Warning: you are using memory for session store.');
  }
  // other
  else {
    this.pub( 'error', 'session_save_handler is not supported.' );
  }

  return true;
};

/**
 * 打开session储存
 */
pro.open = function() {
  if ( this.save_handler == 'memory' || this.save_handler == 'files' ) {
    return true;
  }
  else if ( this.save_handler == 'memcache' ) {

  }
  else if ( this.save_handler == 'redis' ) {

  }
  else if ( this.save_handler == 'mysql' ) {

  } else {
    this.pub( 'error', 'session: pro.open error: not supported handler' );
  }
};

/**
 * 关闭连接
 */
pro.close = function() {
  if ( this.save_handler == 'memory' || this.save_handler == 'files' ) {
    return true;
  }
  else if ( this.save_handler == 'memcache' ) {

  }
  else if ( this.save_handler == 'redis' ) {

  }
  else if ( this.save_handler == 'mysql' ) {

  } else {
    this.pub( 'error', 'session: pro.close error: not supported handler' );
  }
};

/**
 * 读取一个会话信息
 */
pro.read = function( sessionid ) {
  if ( this.save_handler == 'memory' ) {

    return true;
  }
  else if ( this.save_handler == 'files' ) {

  }
  else if ( this.save_handler == 'memcache' ) {

  }
  else if ( this.save_handler == 'redis' ) {

  }
  else if ( this.save_handler == 'mysql' ) {

  } else {
    this.pub( 'error', 'session: pro.read error: not supported handler' );
  }
};

/**
 * 写一个会话
 */
pro.write = function( sessionid, data )
{
  if ( this.save_handler == 'memory' ) {

    return true;
  }
  else if ( this.save_handler == 'files' ) {

  }
  else if ( this.save_handler == 'memcache' ) {

  }
  else if ( this.save_handler == 'redis' ) {

  }
  else if ( this.save_handler == 'mysql' ) {

  } else {
    this.pub( 'error', 'session: pro.write error: not supported handler' );
  }
};

/**
 * 销毁一个会话
 */
pro.destory = function( sessionid ) {
  if ( this.save_handler == 'memory' ) {

    return true;
  }
  else if ( this.save_handler == 'files' ) {

  }
  else if ( this.save_handler == 'memcache' ) {

  }
  else if ( this.save_handler == 'redis' ) {

  }
  else if ( this.save_handler == 'mysql' ) {

  } else {
    this.pub( 'error', 'session: pro.destory error: not supported handler' );
  }
};

/**
 * gc
 */
pro.gc = function()
{
  if ( this.save_handler == 'memory' ) {

    return true;
  }
  else if ( this.save_handler == 'files' ) {

  }
  else if ( this.save_handler == 'memcache' ) {

  }
  else if ( this.save_handler == 'redis' ) {

  }
  else if ( this.save_handler == 'mysql' ) {

  } else {
    this.pub( 'error', 'session: pro.gc error: not supported handler' );
  }
};

////////////////////////////////////////////////////
// 以上封装了各种环境下session储存、读写的操作方法：
////////////////////////////////////////////////////

pro.create = function()
{

};