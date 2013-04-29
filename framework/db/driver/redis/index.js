/**
 * redis driver
 */

var redis    = require('../../../3rd/redis');
var commands = require('../../../3rd/redis/lib/commands.js');

module.exports.redis = function( db, config )
{  

  this._db    = db;
  
  // config
  this.port   = config.port || 6379;
  this.host     = config.host || '127.0.0.1';

  this.client = null;
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

/* 赋值方法 */
commands.forEach(function(cmd, k) {
  pro[cmd] = function() {
    this.init();
    this.client.apply(this.client, arguments);
  };
});