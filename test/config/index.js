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
  'ONDEV': true,
  
  // powerby
  'POWERBY': 'test',

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
  
  // 模块路径
  'MODULE_PATH': ROOT_PATH + '/' + 'module',
  
  // 自定义路由规则
  // 1=> ../#siteControllerName/.../*
  // 2=> ../:paramName/../*
  // :name[正则] 需要转义，与直接量不一样
  'ROUTER': [
    '/#admin/*',
    '/*/#admin/*',
    '/user/:visit_id[\\d+]/*',
    '/#company/#admin/*',
    '/#company/:company_id[\\d+]/#admin/*',
    '/#company/*'
  ],
  
  // COOKIE配置
  'COOKIE': {
    // 加密cookie所用的key
    'secret': 'aB96recbqCpN',
    // cookie有效域名
    'domain': '',
    // 有效路径
    'path': '/',
    // 过期时间：秒(s)
    'expires': 3600*24*30,
    // 某些时候无法设置cookie，可以通过post方式传递到服务器解析，设置此前缀将会解析这种cookie
    // 如 cookie_remember_me
    'post_prefix': 'cookie_',
    // 记录用户信息的cookie
    'remember_me': 'nodeappuser',
    'remember_me_secret': 'thiskeyisforrememberdecode',
    'remember_me_expires': 3600*24*30
  },
  
  // SESSION配置项
  'SESSION': {
    // SESSION保存的方式，默认为文件，可配置为：memcache、redis、mysql、memory、files
    // 建议最好配置为memcached或redis，让第三方管理session过期清理
    'save_handler': 'redis',
    // 如果保存方式为文件，则需要配置保存路径
    'save_path': '/tmp/test_node_session',
    // session有效时间，单位秒(s)
    'lifetime': 60,
    'cookie_param': 'NODESESSIONID',
    // cookie的一些设置
    'cookie_path': '/',
    'cookie_domain': '',
    'cookie_secure': false,
    'cookie_httponly': false,
    // session文件清理几率，仅在save_handler设置为files有效
    // 请定义一个0~1之间的小数
    'gc_probability': 0.2
  },
  
  // db连接信息
  'DB': {
    'driver': 'mysql',
    'host': 'localhost',
    'port': '3306',
    'user': 'node',
    'password': 'node',
    'database': 'node'
  },
  
  // memcache 连接信息
  'MEMCACHE': {

  },
  
  // redis 连接信息
  'REDIS': {
    'port': 6379,
    'host': '127.0.0.1'
  }
};