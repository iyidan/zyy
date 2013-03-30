/**
 * 项目通用函数
 */

var com = module.exports;

/**
 * 解析用户会话信息
 * @param {Object} app 具体的一次请求
 * @param {Function} cb 解析后的callback
 *   function(err, userInfo)
 */
com.remember_me = function(app, cb) {
  
  // cookie key
  var remember_me_key = app.config.COOKIE.remember_me;
  if (!remember_me_key) {
    cb('remember_me_key is not defined.');
    return;
  }

  // cookie sign key
  var cookieSec = app.config.COOKIE.secret;
  if (!cookieSec) {
    cb('config.COOKIE.secret is not defined.');
    return;
  }

  // remember key
  var rc4key = __filename + '/' + app.config.COOKIE.remember_me_secret + app.utils.md5(cookieSec);

  // remember_me_set
  if ( app.user_info ) {
    var remember_me_expires = app.config.COOKIE.remember_me_expires || 3600*24*30;
    var user_id = app.user_info.id;
    var expires_time = (new Date).getTime() + remember_me_expires*1000;
    var cookieInfo = { user_id: user_id, expires_time: expires_time };
    var cookieStr = app.utils.rc4( rc4key, app.utils.base64_encode( JSON.stringify(cookieInfo) ) );
    cookieStr = app.utils.base64_encode(cookieStr);
    // set cookie
    app.COOKIE(remember_me_key, cookieStr, remember_me_expires, true);
    app.SESSION('user_id', user_id);
    cb(null);
    return;
  }

  // remember_me parse
  var cookie = app.COOKIE(remember_me_key);
  if (!cookie) {
    cb('remember_me cookie not found.');
    return;
  }

  cookie = app.utils.unsign(cookie, cookieSec);
  if (!cookie) {
    this.remember_me_expires(app);
    cb('cookie unsign failed.');
    return;
  }

  try {
    cookie = app.utils.base64_decode(cookie);
    cookieInfo = JSON.parse( app.utils.base64_decode( app.utils.rc4(rc4key, cookie) ) );
  } catch(e) {
    this.remember_me_expires(app);
    cb(e);
    return;
  }
  // 格式不对
  if (!cookieInfo || !cookieInfo.user_id) {
    this.remember_me_expires(app);
    cb('decodeRemember failed.');
    return;
  }
  // 过期
  if ( !cookieInfo.expires_time || (new Date).getTime() >= cookieInfo.expires_time ) {
    this.remember_me_expires(app);
    cb('cookieInfo has expired.');
    return;
  }
  // 非数字
  if ( !cookieInfo.user_id || isNaN(cookieInfo.user_id) ) {
    this.remember_me_expires(app);
    cb('user_id is not a Number.');
    return;
  }

  // 检查user
  var user_id = cookieInfo.user_id;
  var that = this;
  app.db.query('SELECT * FROM `user` WHERE `id`=' + user_id + ' LIMIT 1', function(err, user_info){
    if (err) {
      cb(err);
      return;
    }
    user_info = user_info ? user_info[0] : user_info;
    if (!user_info || !user_info.id || user_info.status != 1 ) {
      that.remember_me_expires(app);
      cb('user_info is not found in database.');
      return;
    }
    app.user_info = user_info;
    that.remember_me(app, cb);
  });
};

/**
 * 注销一个会话
 * @param  {Object} app 具体的一次会话信息
 */
com.remember_me_expires = function(app) {

  app.user_info = null;
  
  app.SESSION('user_id', 0);

  var remember_me_key = app.config.COOKIE.remember_me;
  if (remember_me_key) {
    app.COOKIE(remember_me_key, 'expired', 0, true);  
  }
  return true;
};