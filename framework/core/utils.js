/**
 * 核心工具集
 */
var crypto = require('crypto');
var utils = module.exports;

/**
 * md5
 * @param {String} str 需要md5的字符串
 * @param {String} encoding 返回的md5编码类型 默认hex，可选择：binary, hex, base64
 */
utils.md5 = function(str, encoding){
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding || 'hex');
};

/**
 * rc4算法
 * @param {String} 密钥
 * @param {String} text  加密的文本
 */
utils.rc4 = function(key, text) {
  var s = new Array();
  for (var i=0; i<256; i++) {
    s[i] = i;
  }
  var j = 0, x;
  for (i=0; i<256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }
  i = j = 0;
  var ct = [];
  for (var y=0; y<text.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    ct.push(String.fromCharCode(text.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]));
  }
  return ct.join('');
};

/**
 * base64编码解码
 * @param  {String} str 需要编码的字符串
 */
utils.base64_encode = function(str) {
  return new Buffer(str, 'binary').toString('base64').replace(/\=+$/, '');
};
utils.base64_decode = function(str) {
  return new Buffer(str, 'base64').toString('binary');
};

/**
 * sign
 * @param {String} val 需要加密的字符串
 * @param {String} secret 加密所用的key
 */
utils.sign = function(val, secret){
  if ('string' != typeof val) throw new TypeError('cookie required');
  if ('string' != typeof secret) throw new TypeError('secret required');
  return val + '.' + crypto
    .createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/\=+$/, '');
};

/**
 * unsign
 * @param {String} val 需要解密的字符串
 * @param {String} secret 加密时所用的key
 * @return {String|Boolean} 失败返回 false
 */
utils.unsign = function(val, secret){
  if ('string' != typeof val) throw new TypeError('cookie required');
  if ('string' != typeof secret) throw new TypeError('secret required');
  var str = val.slice(0, val.lastIndexOf('.'));
  return exports.sign(str, secret) == val ? str : false;
};

/**
 * 将html标签转换为实体
 * @param {String} html 需要实体化的文本
 */
utils.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * 根据所给长度，随机获取一个唯一的字符串
 * @param {Number} len 指定的长度
 */
utils.uid = function(len) {
  if ( !len ) len = 32;
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len);
};

 /**
 * trim 一个字符串
 * @parma {String} str
 * @param {String} char 可选， 默认为空格
 * @return {String}
 */
utils.trim = function(str, char) {
  if (!char) {
    char = '\\s';
  }
  var reg = new RegExp('(^'+char+'*)|('+char+'*$)', 'g');
  return str.replace(reg, '');
};
utils.ltrim = function(str, char) {
  if (!char) {
    char = '\\s';
  }
  var reg = new RegExp('(^'+char+'*)', 'g');
  return str.replace(reg, '');
};
utils.rtrim = function(str, char) {
    if (!char) {
    char = '\\s';
  }
  var reg = new RegExp('('+char+'*$)', 'g');
  return str.replace(reg, '');
};

/**
 * bufferHelper 此构造函数帮助接收和拼接不同stream的buffer
 * @see https://github.com/JacksonTian/bufferhelper/blob/master/lib/bufferhelper.js
 */
utils.BufferHelper = function() {
  this.buffers = [];
};
/**
 * 添加一个buffer
 * @param {Buffer} buffer 一个buffer
 */
utils.BufferHelper.prototype.add = function( buffer) {
  this.buffers.push(buffer);
  return this;
};
/**
 * 获取已添加的buffer
 * 如果只有一个则返回一个，多个则返回新的buffer
 * @param {Number} length 获取的新的buffer的长度，不传递将会遍历添加的buffer
 * @return {Buffer}
 */
utils.BufferHelper.prototype.get = function( length ) {
  return Buffer.concat(this.buffers, length);
};
/**
 * 根据指定编码将buffer转换为字符串返回
 * @param {String} encoding 编码类型
 *   hex、utf8、ascii、binary、base64、ucs2、utf16le
 */
utils.BufferHelper.prototype.toString = function(encoding, length) {
  return this.get(length).toString(encoding);
};