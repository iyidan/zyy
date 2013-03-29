/**
 * 封装糖饼的atrTemplate
 */

var fs = require('fs');

// 类似于smarty的语法风格
var arttemplate = require('./lib/template-syntax');
// 工具包
var utils   = require('../../core/utils');
var Message = require('../../message').Message;


var template = exports;
// pub/sub 不储存触发过的事件
new Message(false, 50, template);

// 是否初始化过
template.initialized = false;

var htmlCache = {};
var renderCache = {};
var fileCache = {};

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

  content = content + '';

  var renderMd5 = utils.md5(content);
  var md5 = utils.md5(renderMd5 + JSON.stringify(data));  
  
  var cached = htmlCache[md5];
  if (cached && htmlCache.hasOwnProperty(md5)) {
    return cached;
  }

  // 渲染
  try {

    if ( !renderCache[renderMd5] ) {
      renderCache[renderMd5] = arttemplate.compile(content, this.isDebug); 
    }

    htmlCache[md5] = renderCache[renderMd5](data);
    return htmlCache[md5];

  } catch(e) {

    delete renderCache[renderMd5];
    delete htmlCache[md5];
    
    this.pub('error', e);
    
    return '';

  }
};

/**
 * 解析include
 * @param {String} file 需要解析文件全路径
 * @param {Function} cb callback 会将err, content传递给cb
 * @return {String} 返回解析完毕的字符串，可用于artTemplate
 */
template.parseInclude = function(file, cb) {

  if (!file) return '';
  if (typeof cb != 'function') {
    this.pub('error', 'template.parseInclude error: parsing '+file+' cb is not a function obj.');
    return;
  }

  // 缓存
  if (fileCache[file]) return fileCache[file];


  fs.readFile(file, { encoding: 'utf8' }, function(err, content){
    if (err) {
      cb(err);
      return;
    }
    console.log(content, typeof content);
    var matches = content.match(includeReg); 
    if (!matches) {
      cb(null, content);
      return;
    }

    // 订阅多个事件
    var fileMd5 = utils.md5(file);
    var subMsgs = matches.map(function(v){
      return fileMd5 +  '.' + v;
    });
    subMsgs.push(function(message, dataList){
      var ids = message.id.split(',');
      for (var i = 0; i < ids.length; i++) {
        var includeInfo = dataList[ids[i]];
        if (!includeInfo) {
          cb('in template subMsgs dataList '+ids[i]+' parse error.');
          return;
        }
        if (includeInfo.err) {
          cb(includeInfo.err);
          return;
        }
        var tmpContent = includeInfo.content;
        var include    = ids[i].split('.')[1];
        content = content.replace(include, tmpContent);
      }
      cb(null, content);
    });

    // 监听事件
    this.sub.apply(this, subMsgs);

    var that    = this;

    try {

      // 遍历，并行读取文件
      matches.forEach(function(include, k){
        
        var messageId = fileMd5 +  '.' + include; 
        subMsgs.push(messageId);

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
        
        if ( fileCache[tmpFile] ) {
          that.pub(messageId, { err: null, content: fileCache[tmpFile] });
          return;
        }

        // 递归读取
        that.parseInclude(tmpFile, function(err, tmpContent){
          if (err) cb(err);
          return;
          // 存入cache
          if ( that.cache ) fileCache[tmpFile] = tmpContent;
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
  htmlCache   = {};
  renderCache = {};
  fileCache   = {};
};

