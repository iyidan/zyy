/**
 * session内存储存器
 */

module.exports.memory = function() {
  // 用以储存session
  this._sessions = {};
};

var pro = module.exports.memory.prototype;

/**
 * 以下方法
 * this._sm SessionManager 的实例对象
 */
pro.check = function(callback) {
  if ( typeof callback == 'function' ) callback(false, true);
  return true;
};

pro.open = function( callback ) {
  if ( typeof callback == 'function' ) callback(false ,true);
  return true;
}

pro.close = function( callback ) {
  if ( typeof callback == 'function' ) callback(false, true);
  return true;
};

pro.read = function( sessionid, callback ) {
  if ( typeof callback != 'function' ) {
    this._sm.pub('error', 'read session callback is not a function type.');
    return false;
  }
  callback(false, this._read(sessionid));
  return true;
};


pro.write = function( sessionid, data, callback ) {
  if ( typeof data != 'object' ) {
    this._sm.pub('error', 'memory.write error: data is not a object type.');
    return;
  }

  if ( !this._sessions[sessionid] ) {
    this._sessions[sessionid] = {
      'data':   JSON.stringify(data),
      'expires': this._sm.lifetime
    };
  } else {
    this._sessions[sessionid].data = JSON.stringify(data);
  }
  // writeOk
  if ( typeof callback == 'function' ) {
    callback(false, this._read(sessionid));
  }
};

pro.create  = function( callback ) {
  var sessionid = this._sm.uid();
  while( this._sessions[sessionid] ) {
    sessionid = this._sm.uid();
  }

  this.write(sessionid, {});
  if ( typeof callback == 'function' ) {
    callback(false, this._read(sessionid));
  }
};

pro.renew = function(sessionid, callback) {
  if ( !this._sessions[sessionid] ) {
    return this.create(callback);
  }
  this._sessions[sessionid].expires = this._sm.lifetime;
  if ( typeof callback == 'function' ) {
    callback(false, this._read(sessionid));
  }
};

pro.destory = function( sessionid, callback ){
  delete this._sessions[sessionid];
  // destoryOk
  if ( typeof callback == 'function' ) {
    callback(false, true);
  }
};


pro.gc  = function() {
  var m = this;
  for ( var i in this._sessions ) {
    process.nextTick(
        (function(i){
          return function() {
            if ( m._isExpires(m._sessions[i]) ) {
              delete m._sessions[i];
            }
          }
        })(i)
      );
  }
};


pro._isExpires = function( sessionid ) {
  var now = (new Date).getTime();
  if( this._sessions[sessionid] && ( now - this._sessions[sessionid].expires > 0 ) ) {
    return false;
  }
  return true;
};

/**
 * 组装return的数据格式
 * @return {[type]} [description]
 */
pro._read = function(sessionid) {
  if ( !this._sessions[sessionid] ) {
    return {
      'sessionid': sessionid,
      'data': false,
      'expires': 0
    };
  }
  return {
    'sessionid': sessionid,
    'data': JSON.parse(this._sessions[sessionid].data),
    'expires': this._sessions[sessionid].expires
  };
};