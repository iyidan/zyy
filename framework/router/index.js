/**
 * 路由控制
 */

var utils   = require('../core/utils');
var fs      = require('fs');
var Message = require('../message').Message;

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
  
  // 去掉path后面的参数及.（如果有）  
  path = utils.trim(path)
         .toLowerCase()
         .replace(/(\?|\&|\.).*/, '')
         .replace('//', '/');

  path = utils.trim(path, '/');

  // 含有特殊字符
  if ( path.replace(/([a-zA-Z0-9\/_])+/, '') !== '' ) {
    app.routes.status = 404;
    return 404;
  }

  app.routes = {
    // 默认index 模块， /
    'module': '',
    // 默认空 控制器
    'controller': '',
    // 默认控制器文件 index.js
    'controllerFile': 'index.js',
    // dir
    'dir': '',
    // 参数
    'params': [],
    // 项目自定义的特殊规则
    'rule': {
      'siteController': [],
      'params': {}
    }
  };

  
  // module路径
  var modulePath = app.config.MODULE_PATH;
  
  // 访问根 /
  if (!path) {

    app.routes.module = 'index';
    app.routes.controller = 'index';
    app.routes.controllerFile = 'index.js';

  } else {

    // 解析自定义的路由规则
    path  = parseRule(app, path);
    paths = path.split('/');   

    // 优先寻找非indexmodule中的控制器，假设module为第一个参数
    // blog/add
    var tmpModule = paths[0];
    if ( hardCodeCachesStr.indexOf( modulePath + '/' + tmpModule + '/' ) == -1 ) {
      tmpModule = 'index';
      path  = 'index/' + path;
      paths = path.split('/');
    }

    // 找到module
    app.routes.module = tmpModule;
    
    if ( paths.length == 1 ) {

      app.routes.controller = 'index';
      app.routes.controllerFile = 'index.js';
    
    } else {

      /* 从最深层遍历    
      tmpFile:  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc/ddd/eee/fff.js
      tmpDir :  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc/ddd/eee/fff
      tmpFile:  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc/ddd/eee.js
      tmpDir :  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc/ddd/eee
      tmpFile:  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc/ddd.js
      tmpDir :  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc/ddd
      tmpFile:  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc.js
      tmpDir :  /data/www/zyy/test/module/index/controller/aaa/bbb/ccc
      tmpFile:  /data/www/zyy/test/module/index/controller/aaa/bbb.js
      tmpDir :  /data/www/zyy/test/module/index/controller/aaa/bbb
      tmpFile:  /data/www/zyy/test/module/index/controller/aaa.js
      tmpDir :  /data/www/zyy/test/module/index/controller/aaa
      /data/www/zyy/test/module/index/controller/index.js
      { 
        module: 'index',
        controller: 'aaa',
        controllerFile: 'index.js',
        dir: '',
        params: [ 'fff', 'eee', 'ddd', 'ccc', 'bbb', 'aaa' ],
        rule: {} 
      }
      */
      while( paths.length > 1 ) {

        if(app.routes.controller) app.routes.params.push(app.routes.controller);
        app.routes.controller     = '';

        var dir  = path.substring(tmpModule.length + 1);

        var file = dir + '.js';
        var tmpDir  = modulePath + '/' + tmpModule + '/controller/' + dir;
        var tmpFile = modulePath + '/' + tmpModule + '/controller/' + file;

        // console.log('tmpFile: ', tmpFile);
        // console.log('tmpDir : ', tmpDir);

        // file: ../module/blog/controller/add.js
        // path: ../module/blog/controller/add
        if ( hardCodeCaches.indexOf(tmpFile) != -1 ) {
          app.routes.controller = app.routes.params.length > 0 ? app.routes.params.pop() : 'index';
          app.routes.controllerFile = file;
          break;
        // dirs
        } else if ( hardCodeCachesStr.indexOf(tmpDir) != -1 ) {
          app.routes.controller     = app.routes.params.length > 0 ? app.routes.params.pop() : 'index';
          app.routes.controllerFile = dir + '/index.js';
          break;
        }

        var last = paths.pop();
        path = paths.join('/');
        app.routes.controller = last;
      }
    }
  }

  // 是否真实存在
  var realFile = modulePath + '/' + app.routes.module + '/controller/' + app.routes.controllerFile;
  // console.log(realFile);
  if ( hardCodeCaches.indexOf(realFile) == -1 || !app.routes.controller ) {
    app.routes.status = 404;
    return 404;
  }

  app.routes.status = true;
  return true;
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

    if (  m.indexOf('.') === 0 ) {
      return true;
    }

    var tmpModulePath = modulePath + '/' + m;
    if (!isDirSync(tmpModulePath)) return;

    var tmpControllerPath = tmpModulePath + '/' + 'controller';
    if (!isDirSync(tmpControllerPath)) return;

    // 缓存结果，在server重启前有效
    hardCodeCaches    = hardCodeCaches.concat( getDirFiles(tmpControllerPath) );
    hardCodeCachesStr = hardCodeCaches.join();
    // 缓存module
    hardCodeCaches.forEach(function(file, k){
      require(file);
    });
  });

};

/**
 * 分发路由
 * @param  {Object} app 当前请求对象
 */
exports.dispatch = function(app) {

  if (app.routes.status !== true) {
    app.display(app.routes.status);
    return;
  }

  if( app.routes.rule.siteController.length ) {
    dispatchController(app); 
  } else {
    dispatchAction(app);
  }

};

/**
 * 分发大控制器
 */
function dispatchController(app)
{
  
  // 执行的siteController
  var controllerEvents = [];

  // 并行执行siteController
  app.routes.rule.siteController.forEach(function(controller){
    // 尝试加载
    try {
      var siteController = require(app.config.ROOT_PATH + '/controller/' + controller)[controller];
    } catch(e) { }
    if ( typeof siteController == 'function' ) {
      controllerEvents.push('router.controller.'+controller+'.ok');
      siteController(app);
    }
  });

  // 若无大控制器，分派action
  if( !controllerEvents.length ) return dispatchAction(app);
  
  // 注册消息事件回调
  controllerEvents.push(function(message, data){
    dispatchAction(app);
  });

  // 监听
  app.sub.apply(app, controllerEvents);
}

/**
 * 分发action
 * @return {[type]} [description]
 */
function dispatchAction(app)
{
  var filename = app.config.MODULE_PATH + '/' + app.routes.module + '/controller/' + app.routes.controllerFile;
  var actions   = require(filename);

  // 若无action，则访问__call
  var action = actions[app.routes.controller] ? actions[app.routes.controller] : actions['__call'];   
  if ( typeof action != 'function' ) {
    app.display('404');
    return;
  }

  try {

    // 控制器实例
    var actionInstance = {};

    // 监听事件，不监听已经发布的事件
    app.sub('router.actions.ready', function(){
      var msg = action.call(actionInstance, app, app.routes.controller, app.routes.params);
      if ( msg && typeof msg != 'boolean' ) {
        app.showMsg(msg);
      }
    }, false);

    // 发布事件
    if ( typeof actions.__construct == 'function' ) {
      actions.__construct.call(actionInstance, app, function(){
        app.pub('router.actions.ready');
      });
    } else {
      app.pub('router.actions.ready');
    }

  } catch(e) {
    
    app.pub('error', e);
    return;
  
  }
}

/**
 * @private
 * 解析自定义路由
 * @param {Object} app 请求对象
 * @param {String} path 请求路径
 */
function parseRule(app, path)
{
  // 规则：
  // 总控制器site：/#siteName/../../* ...
  // 参数：/*/:paramName/../../* ...
  var paths = path.split('/');
  var rules = app.config.ROUTER || [];
  var paramsMatchedIndex = [];
  
  for ( var i=0; i<rules.length; i++ ) {

    var ruleArr = utils.ltrim( utils.rtrim(utils.trim(rules[i]), '/*'), '/').split('/');
    
    if ( !isMatchRule(paths, ruleArr) ) continue;
    
    ruleArr.forEach(function(v ,k){
      if ( !/^(\#|\:).+/.test(v) ) { 
        return;
      }
      var name = v.substring(1);
      var val  = paths[k];
      if ( v.charAt(0) == '#' ) {
        // 总路由控制器
        if ( app.routes.rule.siteController.indexOf(name) == -1 ) {
          app.routes.rule.siteController.push(name);
        }
      } else {
        v = v.substring(1);
        // 匹配参数
        // 如果有正则过滤
        if (v.indexOf('[') != -1) {
          var reg = utils.trim( v.substring( v.indexOf('[') ), '[]' ); 
          reg  = new RegExp(reg);
          name = v.substring( 0, v.indexOf('[') );
          if (!reg.test(val)) {
            return;
          }
          app.routes.rule.params[name] = val;
          paramsMatchedIndex.push(k);
        }
      }
    });    
  }

  paramsMatchedIndex.forEach(function(v){
    paths[v] = '';
  });

  return utils.trim( paths.join('/').replace('//', '/'), '/' );
}

/**
 * 检查路径与规则是否相等
 * @param  {Array}  paths 路径数组
 * @param  {Array}  rules 路由规则
 * @return {Boolean}       相等返回true，否则返回false
 */
function isMatchRule(paths, rules)
{
  if ( !(paths instanceof Array) || !(rules instanceof Array) )  return false;

  if ( paths.length < rules.length  ) return false;

  for(var i = 0; i < rules.length; i ++) {
    var tmpPath = paths[i];
    var tmpRule = rules[i];
    if ( /^(\#).+/.test(tmpRule) ) tmpRule = tmpRule.substring(1);

    // all
    if ( tmpRule == '*' ) continue;
    // params
    if ( /^(\:).+/.test(tmpRule) ) continue;
    // not match
    if ( tmpPath !== tmpRule ) return false;
  }
  return true;
}

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

  if (  dir.indexOf('/.') !== -1 ) {
    return false;
  }
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

  if (  file.indexOf('/.') !== -1 ) {
    return false;
  }
  var stats = fs.statSync(file);
  if (stats.isFile()) {
    return true;
  }
  return false;
}