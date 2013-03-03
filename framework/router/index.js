/**
 * 路由控制
 */

var utils = require('../core/utils');
var fs    = require('fs');

// 路由硬编码缓存
var hardCodeCaches = [];
var hardCodeCachesStr = '';

/**
 * 解析路由
 * @param  {Object} app [description]
 */
exports.parse = function(app) 
{
  var path = app.SERVER('url').path;
  
  path = utils.trim(path);
  path = utils.trim(path, '/');
  
  // 去掉path后面的参数（如果有）
  path = path.toLowerCase();
  path = path.replace(/(\?|\&).*/, '');
  path = path.replace(/(\.).*/, '');

  app.routes = {
    // 默认index 模块， /
    'module': 'index',
    // 默认 index 控制器
    'controller': 'index',
    // 默认控制器文件 index.js
    'controllerFile': 'index.js',
    // dir
    'dir': '',
    // 参数
    'params': {}
  };

  // @todo项目特殊的路由规则
  
  // /[]
  if (!path) return;

  // module路径
  var modulePath = app.config.MODULE_PATH;
  var tmpModule = '',
    tmpPath = '';

  // split
  paths = path.split('/');

  // /[controller]
  if ( paths.length == 1 ) {
    app.routes.module         = 'index';
    app.routes.controllerFile = 'index.js';
    app.routes.controller     = path;
    return;
  }

  // 优先寻找非indexmodule中的控制器，假设module为第一个参数
  // blog/add
  tmpModule = paths[0];
  if ( hardCodeCachesStr.indexOf( modulePath + '/' + tmpModule + '/' ) != -1 ) {
    app.routes.module = tmpModule;
  } else {
    app.routes.module = tmpModule = 'index';
    // reset path
    path  = 'index/' + path;
    paths = path.split('/');
  }

  tmpPath = modulePath + '/' + tmpModule + '/controller' + path.substring(tmpModule.length) + '.js';
  // path: ../module/blog/controller/add
  // file: ../module/blog/controller/add.js
  if ( hardCodeCaches.indexOf(tmpPath) != -1 ) {
    app.routes.controller = 'index';
    app.routes.controllerFile = paths[paths.length-1] + '.js';
  } else {
    app.routes.controller = paths.pop();
    app.routes.controllerFile = paths[paths.length -1] + '.js';
    tmpPath = modulePath + '/' + tmpModule + '/controller/' + app.controllerFile;
    if ( hardCodeCaches.indexOf(tmpPath) == -1 ) {
      app.pub('routeError', 'parse path error.');
    }
  }
};

/**
 * 分发路由
 * @param  {Object} app 当前请求对象
 */
exports.dispatch = function(app) {
  var filename   = app.config.MODULE_PATH + '/' + app.routes.module + '/controller/' + app.routes.controllerFile;
  var Controller = require(filename).Controller;
  try {
    var actions = new Controller(app);  
  } catch(e) {
    app.pub('error', 'route dispatch error:'+filename + ': [constructor Controller] not found.');
    return;
  }
  
  var action = actions[app.routes.controller] ? actions[app.routes.controller] : actions['__call'];
  if ( typeof action == 'function' ) {
    return action.apply(actions);
  }
  app.pub('routeError', '404');
};

/**
 * 遍历出所有控制器文件
 * 此方法为同步执行方法，只在项目启动的时候编码
 * @param  {String} modulePath 模块根路径
 */
exports.hardCode = function( modulePath ) 
{
  if (!modulePath || typeof modulePath != 'string') {
    return false;
  }

  if (!fs.existsSync(modulePath)) {
    return false;
  }

  var modules = fs.readdirSync(modulePath);
  if ( modules.length == 0 ) {
    return true;
  }

  modules.forEach(function(m){

    var tmpModulePath = modulePath + '/' + m;
    if (!isDirSync(tmpModulePath)) return;

    var tmpControllerPath = tmpModulePath + '/' + 'controller';
    if (!isDirSync(tmpControllerPath)) return;

    // 缓存结果，在server重启前有效
    hardCodeCaches    = hardCodeCaches.concat( getDirFiles(tmpControllerPath) );
    hardCodeCachesStr = hardCodeCaches.join();
    console.log(hardCodeCaches);
    // 缓存module
    hardCodeCaches.forEach(function(file, k){
      require(file);
    });
  });

};

/**
 * 返回一个包含这个目录下的所有文件的列表
 * @param  {String} dir
 * @return {Array}
 */
function getDirFiles( dir )
{
  var files = [];
  
  if (isDirSync(dir)) {
    var dirFiles = fs.readdirSync(dir);
    dirFiles.forEach(function(file){
      var filename = dir + '/' + file;
      // 递归
      if (isDirSync(filename)) {
       files = files.concat( getDirFiles(filename) );
      } 
      // push 如果与真实的路径不符则不会push到files中
      else if (isFileSync(filename) && fs.realpathSync(filename) == filename ) {
        files.push(filename);
      }
    });
  }

  return files;
}

/**
 * 同步方法，是否是目录
 * @param  {String}  dir [description]
 * @return {Boolean}     [description]
 */
function isDirSync(dir)
{
  var stats = fs.statSync(dir);
  if (stats.isDirectory()) {
    return true;
  }
  return false;
}

/**
 * 同步方法，是否是文件
 * @param  {String}  file [description]
 * @return {Boolean}      [description]
 */
function isFileSync(file)
{
  var stats = fs.statSync(file);
  if (stats.isFile()) {
    return true;
  }
  return false;
}