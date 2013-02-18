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
pro.check = function() {
  return true;
};

pro.open = function() {
  return true;
}

pro.close = function( callback ) {
  callback();
};

pro.read = function( sessionid, callback ) {
  sessionid = this._checkSessionId(sessionid);
  if ( !sessionid ) {
    sm.pub('error', 'memory.read error: sessionid is not a string type.');
    return;
  }
  if ( this._isExpires(sessionid) ) {
    sm.pub('readOk', false);
    return;
  }

  // readOk
  sm.pub('readOk', JSON.parse(this._sessions[sessionid].data));
};


pro.write = function( sm, sessionid, data ) {

  sessionid = this._checkSessionId(sessionid);
  if ( !sessionid ) {
    sm.pub('error', 'memory.write error: sessionid is not a string type.');
    return;
  }

  if ( typeof data != 'object' ) {
    sm.pub('error', 'memory.write error: data is not a object type.');
    return;
  }

  if ( !this._sessions[sessionid] ) {
    this._sessions[sessionid] = {
      'data':   JSON.stringify(data),
      'expires': sm.lifetime
    };
  } else {
    this._sessions[sessionid].data = JSON.stringify(data);
  }
  // writeOk
  sm.pub('writeOk', {
    'sessionid': sessionid,
    'data': data
  });
};


pro.destory = function( sm, sessionid ){
  sessionid = this._checkSessionId(sessionid);
  if ( !sessionid ) {
    sm.pub('error', 'memory.destory error: sessionid is not a string type.');
    return;
  }
  delete this._sessions[sessionid];
  // destoryOk
  sm.pub( 'destoryOk', sessionid );
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
  sessionid = this._checkSessionId(sessionid);
  if ( !sessionid ) {
    return true;
  }
  var now = (new Date).getTime();
  if( this._sessions[sessionid] && ( now - this._sessions[sessionid].expires > 0 ) ) {
    return false;
  }
  return true;
};

/**
 * 检查sessionid是否合法
 * @param  {String} sessionid 
 * @return {String|Boolean}
 */
pro._checkSessionId = function( sessionid ) {
  if ( !sessionid || typeof sessionid != 'string' ) {
    return false;
  }
  sessionid = sessionid.trim();
  if ( sessionid ) {
    return sessionid;
  }
  return false;
};