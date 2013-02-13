/**
 * 项目配置文件
 */

var CONFIG_PATH  = __dirname;
var ROOT_PATH    = CONFIG_PATH.slice(0, -7);
var FW_PATH      = '/data/www/zyy/framework';

exports.config = {
  // 项目名称
  'PROJECT_NAME': 'test',
  // 是否是开发环境
  'ONDEV': false,
  // 监听ip
  'IP': '0.0.0.0',
  // 监听端口
  'PORT': 3000,
  // 静态文件路径
  'STATIC_PATH': ROOT_PATH + '/static',
  // 项目根路径
  'ROOT_PATH': ROOT_PATH,
  // 框架路径
  'FW_PATH': FW_PATH,
  // db连接信息
  'DB': {

  },
  // memcache 连接信息
  'MEMCACHE': {

  },
  // redis 连接信息
  'REDIS': {

  }
};