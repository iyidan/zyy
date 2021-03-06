/**
 * 封装糖饼的atrTemplate
 */

var fs = require('fs');

// 类似于smarty的语法风格
var arttemplate = require('./lib/template-syntax');
// 去掉默认的
arttemplate.isEscape = false;

// 工具包
var utils   = require('../../core/utils');
var Message = require('../../message').Message;


var template = exports;
// pub/sub 不储存触发过的事件
new Message(false, 50, template);

// 是否初始化过
template.initialized = false;

var fileCache   = {};
var renderCache = {};

var includeReg = /\{include(.*?)\}/gm;

/**
 * 初始化
 */
template.init = function(config) {
  // 是否debug
  this.isDebug  = config.isDebug  || true;
  // 是否文件缓存
  this.cache    = config.cache || true;
  // 模板（项目）根路径
  this.rootPath = config.rootPath || '';
  if ( !this.rootPath ) {
    this.pub('error', 'template.init error: config.rootPath is not defined.');
    return;
  }
  this.rootPath = utils.rtrim(this.rootPath, '/');

  // 模板主题
  this.theme = config.theme || 'default';

  this.config      = config;
  this.initialized = true;
}

/**
 * 由data渲染模板content
 * @param  {String} content 模板
 * @param  {Object} data    模板数据
 * @return {String}         渲染好的html字符串
 */
template.render = function(content, data) {

  var renderMd5 = utils.md5(content);

  // 渲染
  try {
    if ( !renderCache[renderMd5] ) {
      renderCache[renderMd5] = arttemplate.compile(content, this.isDebug);
    }
  } catch(e) {
    delete renderCache[renderMd5];
    this.pub('error', e);    
    return '';
  }
  
  return renderCache[renderMd5](data);

};

/**
 * 解析include
 * @param {String} file 需要解析文件全路径
 * @param {Function} cb callback 会将err, content传递给cb
 * @return {String} 返回解析完毕的字符串，可用于artTemplate
 */
template.parseInclude = function(file, cb) {
  
  if (typeof cb != 'function') {
    this.pub('error', 'template.parseInclude error: parsing '+file+' cb is not a function obj.');
    return;
  }
  if (!file) {
    cb('file is empty.');
    return;
  }


  var fileMd5 = utils.md5(file);

  // 文件缓存
  if (fileCache[fileMd5]) {
    //console.log('fileCache: ', Object.keys(fileCache));
    cb(null, fileCache[fileMd5]);
    return;
  }

  var that = this;

  fs.readFile(file, 'utf8', function(err, content){
    if (err) {
      cb(err);
      return;
    }

    var matches = content.match(includeReg);
    
    if (!matches) {
      cb(null, content);
      return;
    }

    // 订阅多个事件
    var subMsgs = matches.map(function(v){
      return fileMd5 +  '.' + v;
    });
    subMsgs.push(function(message, dataList){
      //console.log(message, dataList);
      var ids = message.id.split(',');
      for (var i = 0; i < ids.length; i++) {
        // 单个包含 多个包含
        var includeInfo = ids.length == 1 ? dataList : dataList[ids[i]];
        if (!includeInfo) {
          cb('in template subMsgs dataList '+ids[i]+' parse error.');
          return;
        }
        if (includeInfo.err) {
          cb(includeInfo.err);
          return;
        }
        var tmpContent = includeInfo.content;
        // md5 32 + 1 (".")
        var include    = ids[i].substring(33);
        content = content.replace(include, tmpContent);
      }
      // 存入缓存
      if(that.cache) fileCache[fileMd5] = content;
      cb(null, content);
    });

    // 监听事件
    that.sub.apply(that, subMsgs);

    try {

      // 遍历，并行读取文件
      matches.forEach(function(include, k){
        
        var messageId = fileMd5 +  '.' + include; 

        include = include.replace(/\'/g, '"');
        var tmpFile   = include.match(/file\=\"(.+?)\"/);
        var tmpModule = include.match(/module\=\"(.+?)\"/);
        
        if (!tmpFile) {
          that.pub(messageId, { err: new Error('include file not matched'), content: '' });
          return;
        }

        tmpFile = tmpFile[1];
        tmpModule = tmpModule ? tmpModule[1] : '';
        
        if ( tmpModule ) {
          tmpFile = that.rootPath + '/module/' + tmpModule + '/template/' + that.theme + '/' + tmpFile;
        } else {
          tmpFile = that.rootPath + '/template/' + that.theme + '/' + tmpFile; 
        }
        
        var tmpFileMd5 = utils.md5(tmpFile);
        if ( fileCache[tmpFileMd5] ) {
          that.pub(messageId, { err: null, content: fileCache[tmpFileMd5] });
          return;
        }

        // 递归读取
        return that.parseInclude(tmpFile, function(err, tmpContent){
          if (err) {
            that.pub(messageId, { err: err, content: '' });
            return;
          }
          // 存入cache
          if ( that.cache ) fileCache[tmpFileMd5] = tmpContent;
          //console.log('cache file: ', Object.keys(fileCache));
          that.pub(messageId, { err: null, content: tmpContent });
        });
      });

    } catch(e) {

      that.pub('error', e);

    }
  });

};

/**
 * 清除模板缓存
 * @return {[type]} [description]
 */
template.clearCache = function() {
  fileCache   = {};
  renderCache = {};
};