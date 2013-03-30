/**
 * session内存储存器
 */

module.exports.files = function() {
  
};

var pro = module.exports.files.prototype;

/**
 * 以下方法
 * @param {Object} sm SessionManager 的实例对象
 * check 方法是同步的，只在启动服务器的时候调用
 */
pro.check = function() {
  try {
      this.save_path = utils.rtrim(this.save_path, '/');
      if (!fs.existsSync(this.save_path)) {
        fs.mkdirSync(this.save_path, '0777');
      }
      else{
        fs.appendFileSync(this.save_path + '/' + utils.uid(), (new Date).toString());
      }
      this._sm.pub('checkOk');
    } catch(err) {
      this._sm.pub( 'error', 'session_save_path is not writeable ' + err.toString() );
    }
};

pro.open = function( sm ) {
  sm.pub( 'opened' );
}

pro.close = function( sm ) {
  sm.pub( 'closed' );
};


pro.read = function( sm, sessionid ) {
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