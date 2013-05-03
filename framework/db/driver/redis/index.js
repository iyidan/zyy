/**
 * redis driver
 */

var redis       = require('../../../3rd/redis');
var commands    = require('./commands.js');
var cmd_key_map = require('./cmd_key_map.js');

var utils = require('../../../core/utils.js');

// redis实例
var redis = null;

module.exports.redis = function( db, config )
{  

  this._db    = db;
  
  // config
  this.port = config.port || 6379;
  this.host = config.host || '127.0.0.1';
  this.ps   = config.ps || 'redisDBPS';

  this.client = null;
  this._name = 'redis';

  redis = this;

  return redis;
};

/* 原型 */
var pro = module.exports.redis.prototype;

/**
 * 初始化redis连接
 */
pro.init = function() {
  
  if ( this.client === null ) {
    
    this.client = redis.createClient(this.port, this.host);
    
    var that = this;

    // 注册错误处理函数
    this.client.on('error', function(err){
      // 尝试关闭
      try { that.client.quit(); } catch(e) {};
      that.client = null;
      that._db.pub('error', err);
    });

    // 注册连接断开处理函数
    this.client.on('end', function(){
      that.client = null;
    });
  }

  return this.client;

};

/**
 * 建立命名空间
 */
pro.NS = function(ns) {
  return new NSObject(ns);
};

/**
 * 每次NSObject生成的对象
 */
function NSObject(ns, driver)
{
  this._ps     = redis.ps;
  this._ns     = ns || 'redisDBNS';
  // this.K生成的列表
  this._keys   = [];

  this._cmd    = '';
  this._cmdMap = null;

  // 存放查询数据的地方
  this.data      = null;
  this.isSolved  = false;
  this.keyPre    = this._ps + ':' + this._ns;
}

/**
 * [execCmd description]
 * @param  {[type]} cmd  [description]
 * @param  {[type]} args [description]
 * @return {[type]}      [description]
 */
NSObject.prototype.execCmd = function(cmd, args) {
  // 不需要返回值的查询
  if (args.length == 0) {
    // 执行命令
    redis[cmd].apply(redis, args);
    return;
  }

  this._cmd = cmd;
  // 获取cmdMap
  this._cmdMap   = cmd_key_map[cmd];

  // 去掉最后一个回调函数
  var callback = typeof args[args.length -1] == 'function' ? Array.prototype.pop.call(args) : null;
  // 请求参数中的cmdMap
  var reqK = null;
  // 响应中的cmdMap
  var resK = null;
  // 生成的回调函数
  var cb = null;

  // 需要动态判断的命令
  if ( this._cmdMap == '?' ) {

    // lua脚本
    if ( cmd == 'eval' || cmd == 'evalsha' ) {
      var keyNum = args[1] || 0;
      for ( var i = 2; i < (keyNum+2); i++ ) {
        args[i] = this.solveKey(args[i]);
      }
    }
    // 有序集合 
    else if ( cmd == 'zunionstore' || cmd == 'zinterstore' ) {
      args[0] = this.solveKey(args[0]);
      var keyNum = args[1] || 0;
      for ( var i = 2; i < (keyNum+2); i++ ) {
        args[i] = this.solveKey(args[i]);
      }
    }

  }
  // [ [keystart, keylength], [keystart, keylength] ] 
  else if ( this._cmdMap ) {

    reqK = this._cmdMap[0];
    resK = this._cmdMap[1];
  
    // 仅1个key且居于第1位置
    if ( reqK == 1 ) {
      args[0] = this.solveKey(args[0]);
    }
    // 其他情况
    else if ( reqK ) {
      args = this.solveKeys(args, reqK[0], reqK[1]);
    }

  }

  // 返回回调函数处理
  if ( callback ) {
    var that = this;
    cb = function(err, result) {
    
      if ( err ) {
        callback(err, that);
        return;
      }

      if ( resK == 1 ) {
        result = that.solveKey(result, true);
        that.isSolved = true;
      } else if ( resK && result instanceof Array ) {
        result = that.solveKeys(result, resK[0], resK[1], true);
        that.isSolved = true;
      }

      that.data = result;

      // 执行回调函数 
      callback(err, that );
    };
  }

  // 组装函数
  if ( cb ) {
    Array.prototype.push.call(args, cb);
  }

  // 执行命令
  redis[cmd].apply(redis, args);
};

/**
 * 建立/反解keys
 */
NSObject.prototype.solveKeys = function( result, keyStart, keyNum, isUnBuild ) {

  // 最后一个key不是
  if ( keyNum == -1 ) {
    for (var i = keyStart; i < result.length -1; i++) {
      result[i] = this.solveKey(result[i], isUnBuild);
    }
  }
  // 全部参数都是key
  else if ( keyNum == '*' ) {
    for (var i = keyStart; i < result.length; i++) {
      result[i] = this.solveKey(result[i], isUnBuild);
    } 
  }
  // 间隔key
  else if ( keyNum == '+' ) {
    for (var i = keyStart; i < result.length; i+=2) {
      result[i] = this.solveKey(result[i], isUnBuild);
    }  
  }
  // 数字
  else if ( !isNaN(keyNum) ) {
    for (var i = keyStart; i < keyNum; i++) {
      result[i] = this.solveKey(result[i], isUnBuild);
    } 
  }  

  return result;
};

/**
 * 构造/反解 key
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
NSObject.prototype.solveKey = function( key, isUnBuild ) {
  
  // 反解
  if ( isUnBuild ) {
    if ( key.indexOf ( this.keyPre ) == 0 ) {
      return key.substring( this.keyPre.length );
    }
    // 如果解析不了 返回原key
    return key;
  }

  // 构造
  return this.keyPre + ':' + key;
};

/**
 * 重复调用ns
 */
NSObject.prototype.K = function(key) {
  if ( key ) {
    this._keys.push(key);
    this.keyPre = this.keyPre + ':' + key;
  }
  return this;
};

/* 赋值方法 */
commands.forEach(function(cmd, k) {

  // 直接使用原始的redis命令
  pro[cmd] = function() {
    this.init();
    this.client[cmd].apply(this.client, arguments);
  };

  // 为Ns对象增加方法
  NSObject.prototype[cmd] = function() {
    this.execCmd(cmd, arguments);
  };

});