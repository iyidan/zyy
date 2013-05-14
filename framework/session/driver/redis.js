/**
 * session内存储存器
 */

var redis = require('../../3rd/redis');

module.exports.redis = function(sm) {
  
  // 引用sessionManager
  this._sm = sm;

  // redis配置
  this.redisConfig = sm.config.REDIS || (sm.config.DB.driver == 'redis' ? sm.config.DB : '');
  
  // redis 连接
  this.redisWr = null;

  // 键前缀
  this.keyPre = 'NODESESSION_' + this._sm.config.PROJECT_NAME + '_';

};

/**
 * 原型
 * @type {Object}
 */
var pro = module.exports.redis.prototype;

/**
 * 写session的lua脚本
 * @type {String}
 * @return {String} OK 如果成功
 */
pro.luaWrite = "\
local expiresTime = table.remove(ARGV, 1);\n\
local setR = redis.pcall('hmset', KEYS[1], unpack(ARGV));\n\
redis.pcall('pexpire', KEYS[1], expiresTime);\n\
return setR;";

/**
 * 创建session的脚本
 */
pro.luaCreate = "\
if redis.pcall('exists', KEYS[1]) == 0 then\n\
  local setR = redis.pcall('hset', KEYS[1], ARGV[2], ARGV[3]);\n\
  redis.pcall('pexpire', KEYS[1], ARGV[1]);\n\
  return setR;\n\
else\n\
  return nil;\n\
end";

/**
 * 获取写入redis的参数数组，方便eval调用
 * @param  {Object} data 要写入session的键值对，会过滤掉非字符串的值
 * @param {Function} cb 执行hmset后的回调函数 function(err, result) ...
 * @return {Array|null}      参数数组
 */
pro.getWriteArgs = function(sessionid, data, cb) {
  
  var args = [this.luaWrite, 1, this._key(sessionid), this._sm.lifetime];
  
  for ( var i in data ) {
    var tpval = typeof data[i];
    if ( data.hasOwnProperty(i) && ('string' == tpval || 'number' == tpval) ) {
      args.push(i);
      args.push(data[i]);
    }
  }

  if ( args.length <= 4 ) { return null; }
  if ( 'function' == typeof cb ) args.push(cb);

  return args;
};

/**
 * 获取创建session的参数数组，方便eval调用
 */
pro.getCreateArgs = function(sessionid, cb) {
  return [this.luaCreate, 1, this._key(sessionid), this._sm.lifetime, '_sessiondefault', '_sessiondefault', cb];
};


/**
 * 以下方法
 * this._sm SessionManager 的实例对象
 */
pro.check = function() {
  
  if ( !this.redisConfig ) {
    this._sm.pub('error', 'redisConfig is empty in redis SESSION driver');
    return false;
  }

  return true;
};

pro.open = function() {
  
  if ( this.redisWr !== null ) {
    return this.redisWr;
  }

  var port = this.redisConfig.port || 6379;
  var host = this.redisConfig.host || '127.0.0.1';

  this.redisWr = redis.createClient(port, host);

  var that = this;
  
  this.redisWr.on('error', function(err){
    
    try { that.redisWr.quit(); } catch(e) { }
    that.redisWr = null;
    that._sm.pub('error', err);

  });

  return this.redisWr;
}

pro.close = function( callback ) {
  if ( this.redisWr !== null ) {
    return this.redisWr.end();
  }
};

pro.write = function( sessionid, data, callback ) {
  
  if ( typeof data != 'object' ) {
    callback('redis.write error: data is not a object type.', null);
    return;
  }

  var args = this.getWriteArgs(sessionid, data, function(err, result){
    if ( err ) {
      callback(err, null);
      return;
    }
    callback(false, { 'sessionid':sessionid, 'data':data });
  });

  if ( !args ) {
    callback('session data is empty.', null);
    return;
  }

  var redisWr = this.open();
  // 执行
  redisWr.eval.apply(redisWr, args);

};

pro.create  = function( callback ) {

  var sessionid = this._sm.uid();
  var that = this;
  var args = this.getCreateArgs(sessionid, function(err, result){
    if (err) {
      callback(err, null);
      return;
    }
    if ( result != 1 ) {
      that.create(callback);
      return;
    }
    callback(false, { sessionid: sessionid, data: { '_sessiondefault': '_sessiondefault' } });
    return;
  });

  var redisWr = this.open();
  redisWr.eval.apply(redisWr, args);
};

pro.renew = function(sessionid, callback) {

  var that = this;
  
  this.open().pexpire( this._key(sessionid), this._sm.lifetime, function(err, status){

    if ( err ) {
      callback(err, null);
      return;
    }
    // 设置一个不存在的
    if ( status != 1 ) {
      that.create(callback);
      return;
    }
    // 返回存在的
    that.read(sessionid, callback);
    return;
  });
};

pro.destory = function( sessionid, callback ){
  
  this.open().del( this._key(sessionid), function( err, status ){
    callback(err, true);
  });
};

pro.gc  = function() { };


/**
 * 组装return的数据格式
 * @return {[type]} [description]
 */
pro.read = function(sessionid, callback) {

  this.open().hgetall( this._key(sessionid), function( err, val ){

    if ( err ) {
      callback( err, null );
      return;
    }
    if ( !val ) {
      callback( false, { 'sessionid': sessionid, 'data': false } );
      return;
    }
    callback( false, { 'sessionid': sessionid, 'data': val } );
  });
};

pro._key = function(sessionid) {
  return this.keyPre + sessionid;
}