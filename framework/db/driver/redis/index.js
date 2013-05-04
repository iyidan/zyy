/**
 * redis driver
 */

var redis       = require('../../../3rd/redis');
var commands    = require('./commands.js');
var cmd_key_map = require('./cmd_key_map.js');
var lua_scripts = require('./lua_scripts.js');

var utils       = require('../../../core/utils.js');

// redis实例
var r = null;

module.exports.redis = function( db, config )
{  

  this._db    = db;
  
  // config
  this.port = config.port || 6379;
  this.host = config.host || '127.0.0.1';
  this.ps   = config.ps || 'redisDBPS';

  this.client = null;
  this._name = 'redis';

  r = this;

  return r;
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
  this._ps     = r.ps;
  this._ns     = ns || 'redisDBNS';

  this._cmd    = '';
  this._cmdMap = null;

  // 存放查询数据的地方
  this.data      = null;
  this.isSolved  = false;
  this.keyPre    = this._ps + '|' + this._ns;
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
    r[cmd].apply(r, args);
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
      } else if ( !resK ) {
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
  r[cmd].apply(r, args);
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
 * 重复调用key
 */
NSObject.prototype.key = function(key) {
  if ( key ) {
    this.keyPre = this.keyPre + ':' + key;
  }
  return this;
};

/**
 * 清除key的设置
 * @return {[type]} [description]
 */
NSObject.prototype.clear = function() {
  this.keyPre = this._ps + '|' + this._ns;
};

/**
 * 删除一个对象
 * @param  {[type]}   key [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */ 
NSObject.prototype.del = function(key, cb) {
  // 执行脚本
  if ( cb ) {
    keys = [lua_scripts['delKeys'], 1, key, cb];
  } else {
    keys = [lua_scripts['delKeys'], 1, key];
  }
  this.execCmd('eval', keys);
};

/**
 * 重置某个（或多个）属性
 */
NSObject.prototype.update = function(info, cb) {
  
  if ( 'object' != typeof info ) {
    if ( cb ) {
      cb('info is not an object', null);  
    }
    return;
  }

  var keys   = Object.keys(info);
  var length = keys.length;
  
  if ( length == 0 ) {
    if ( cb ) {
      cb('info is not an object', null);  
    }
    return;
  }

  for ( var i = 0; i < length; i++ ) {
    // 对象转换为数组
    var tmpType = typeof info[keys[i]];
    if ( 'string' != tmpType && 'number' != tmpType ) {
      // 只支持字符串、数字的更新
      if ( cb ) {
        cb('update info[keys[i]] is not a string or number type', null);  
      }
      return;
    } else {
      keys.push(info[keys[i]]);
    }
  }

  // 组装lua脚本
  keys.unshift(length);
  keys.unshift(lua_scripts['updateKeys']);
  if ( cb ) {
    keys.push(cb);
  }

  // 执行脚本
  this.execCmd('eval', keys);

};

/**
 * 获取一个对象的字段值
 * @param  {Array, string}   info  需要获取的字段类型
 * @param  {Function} cb   回调函数
 * @return {Object}        返回标准的NSObject实例
 */
NSObject.prototype.getKeys = function() {
  
  // 没有回调函数
  if ( arguments.length < 2 ) {
    return this;
  }

  var cb = Array.prototype.pop.call(arguments);
  if ( 'function' != typeof cb ) {
    return this;
  }

  var keys = [];
  if ( arguments.length == 1 && arguments[0] instanceof Array) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments, 0, arguments.length);
  }

  // 组装lua脚本
  keys.unshift(keys.length);
  keys.unshift(lua_scripts['getKeys']);
  keys.push(cb);

  // 执行脚本
  this.execCmd('eval', keys);

};



/* 赋值方法 */
commands.forEach(function(cmd, k) {

  // 直接使用原始的redis命令
  pro[cmd] = function() {
    this.init();
    this.client[cmd].apply(this.client, arguments);
  };

  // 为Ns对象增加方法
  NSObject.prototype['_'+cmd] = function() {
    this.execCmd(cmd, arguments);
  };

});