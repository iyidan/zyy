/**
 * cookie解析/设置模块
 * 重新封装connect的cookie模块
 */

module.exports = {

  /**
   * 解析request的cookie字符串
   * @param {Object}  app 
   * @example parse('foo=123') { foo:123 }
   * @example parse('foo="bar=123456789&name=Magic+Mouse"') { foo: 'bar=123456789&name=Magic+Mouse' }
   * @example parse('email=%20%22%2c%3b%2f') { email: ' ",;/' }
   * @example parse('foo=%1;bar=bar') { foo: '%1', bar: 'bar' }
   */
  parse: function(app){
    var obj = {};
    var str = app.SERVER('headers').Cookie;

    if (str) {
      var pairs = str.split(/[;,] */);
      var thisModule = this;
      pairs.forEach(function(pair) {
        var eq_idx = pair.indexOf('=');
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if ( !key ) return;
        // quoted values
        if ('"' == val[0]) {
          val = val.slice(1, -1);
        }
        // 只解析一次不覆盖前值
        if (obj[key] == undefined) {
          try { val = decodeURIComponent(val); } catch (e) { }
          obj[key] = val;
        }
      }); 
    }
    app._COOKIE = obj;
  },
  
  /**
   * 生成cookie字符串
   * @param {String} name
   * @param {String} val
   * @param {Object} opt, keys: maxAge/domain/path/expires/httpOnly/secure 
   * @return {String} 
   * @example cookie.serialize('foo', 'bar baz') 'foo=bar%20baz'
   * @example cookie.serialize('foo', 'bar', { secure: true } ) 'foo=bar; Secure'
   */
  serialize: function(name, val, opt){
    var pairs = [name + '=' + encodeURIComponent(val)];
    opt = opt || {};

    if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
    if (opt.domain) pairs.push('Domain=' + opt.domain);
    if (opt.path) pairs.push('Path=' + opt.path);
    if (opt.expires) pairs.push('Expires=' + opt.expires);
    if (opt.httpOnly) pairs.push('HttpOnly');
    if (opt.secure) pairs.push('Secure');

    return pairs.join('; ');
  },
  
  /**
   * 设置响应cookie
   * @param {Object} req 本次设置的请求对象 传递此参数是为了本次能访问到设置的值
   * @param {Object} res 本次设置的响应对象
   * @param {String} key 本次设置的键名
   * @param {String} val 本次设置的值
   * @param {Object} opt keys: maxAge/domain/path/expires/httpOnly/secure
   * @return {Boolean}
   */
  setCookie: function(app, key, val, opt){
    if ( typeof key != 'string' || typeof val != 'string' ) {
      app.pub( 'error', {
        'file': __filename,
        'err': '[Function setCookie] key/val is not a string'
      });
      return;
    }
    key = key.trim();
    val = val.trim();
    if (!key || !val) {
      app.pub( 'error', {
        'file': __filename,
        'err': '[Function setCookie] key/val is empty'
      });
      return;
    }

    var expires = opt.expires;
    var date = new Date();
    date.setTime(date.getTime() + opt.expires*1000 );
    opt.expires = date.toUTCString();

    var cookieStr = this.serialize(key, val, opt);
    if ( app._setCookies === undefined ) app._setCookies = [];
    app._setCookies.push(cookieStr);

    if ( expires > 0 ) app._COOKIE[key] = val;
    return true;
  }
};