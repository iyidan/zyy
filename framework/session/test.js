/**
 * test session
 */

var assert         = require('assert');
var test           = require('../test');
var SessionManager = require('./index.js').SessionManager;

var config = {
  // SESSION保存的方式，默认为文件，可配置为：memcache、redis、mysql、memory
  // 建议最好配置为memcached或redis，让第三方管理session过期清理
  'save_handler': 'files',
  // 如果保存方式为文件，则需要配置保存路径
  'save_path': '/tmp/test_node_session',
  // session有效时间，单位秒(s)
  'lifetime': 3600*24*30,
  // cookie的一些设置
  'cookie_path': '/',
  'cookie_domain': '',
  'cookie_secure': false,
  'cookie_httponly': false,
  // session文件清理几率，仅在save_handler设置为files有效
  'gc_probability': 1 / 100
};

//var sm = new SessionManager(config);

for (var i = 0 ; i < 20; i++) {
  if ( i ==4) break;
}
console.log(i);