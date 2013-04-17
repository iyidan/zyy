/**
 * session内存储存器
 */

var redis = require('../../3rd/redis');

module.exports.redis = function(sm) {
  
  // 引用sessionManager
  this._sm = sm;

  // redis配置
  this.redisConfig = sm.config.REDIS;
  
  // redis 连接
  this.redisWr = null;

  // 键前缀
  this.keyPre = 'NODESESSION_' + this._sm.config.PROJECT_NAME + '_';

};

var pro = module.exports.redis.prototype;

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
  // 选择数据库2
  this.redisWr.select(2);

  var that = this;
  
  this.redisWr.on('error', function(err){
    
    try { that.redisWr.end(); } catch(e) { }
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

  this.open().set( this._key(sessionid), JSON.stringify(data), function(err, status){
    if ( err ) {
      callback(err, null);
      return;
    }
    callback(false, { 'sessionid':sessionid, 'data':data });
  });

};

pro.create  = function( callback ) {

  var sessionid = this._sm.uid();
  var key = this._key(sessionid);
  var that = this;

  this.open().setnx( key, JSON.stringify({}), function(err, status){
    if ( err ) {
      callback(err, null);
      return;
    }
    // 已经存在
    if ( status == 0 ) {
      that.create(callback);
      return;
    } else {
      that.open().pexpire( key, that._sm.lifetime, function(err, status){
        if ( err ) {
          callback(err, null);
          return;
        }
        callback(false, { 'sessionid': sessionid, 'data': {} });
      });
    }
  });
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

  this.open().get( this._key(sessionid), function( err, val ){

    if ( err ) {
      callback( err, null );
      return;
    }
    if ( !val ) {
      callback( false, { 'sessionid': sessionid, 'data': false } );
      return;
    }
    callback( false, { 'sessionid': sessionid, 'data': JSON.parse( val ) } );
  });
};

pro._key = function(sessionid) {
  return this.keyPre + sessionid;
}