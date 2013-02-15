/**
 * 消息订阅/发布模块
 */

var EventEmitter = require( 'events' ).EventEmitter;

/**
 * 发布订阅构造器
 * @param {Boolean} storePub 是否保存发布过的消息：
 *   true:  保存在this._publishedMessages 里
 *   false: 不保存，因此当订阅一个发布过的消息是收不到数据的，除非这个消息被重新触发
 *   默认为false
 * @param {Number} listenersNum 同一个消息最多限制多少个订阅者，超出会有警告提示，设置为0不限制
 * @param {Object} proxy 代理具体消息体对象，如果传递此参数，构造器会将_message/pub/sub 方法添加到对象上  
 */
var Message = exports.Message = function( storePub, listenersNum, proxy ) {

  this._storePub     = storePub === undefined  ?  false  :  !!storePub;
  this._listenersNum = isNaN(listenersNum)     ?  50    :  parseInt(listenersNum);

  // 设置单个事件监听数
  this._emitter = new EventEmitter();
  this._emitter.setMaxListeners(this._listenersNum);

  // 已经发布的消息
  this._publishedMessages = {};

  // 需要协同订阅的多个消息 
  this._multiSubList = {};

  // 添加方法到proxy
  if ( typeof proxy == 'object' ) {
    proxy._message = this;
    proxy.pub = function() {
      this._message.pub.apply(this._message, arguments);
    };
    proxy.sub = function() {
      this._message.sub.apply(this._message, arguments);
    };
  }
};

/**
 * 发布一个消息
 * @param {String} messageId 消息标识
 * @param {Mixed} data 传递给订阅者的数据
 * @return {Boolean} 是否成功执行
 */
Message.prototype.pub = function( messageId, data ) {
  // 记入到_publishedMessages
  data = data || null;
  
  // 如果此消息订阅曾经被触发过 检查协同订阅，覆盖新值
  if ( this._publishedMessages[messageId] !== undefined ) {
    for( var i in this._multiSubList ) {
      if ( i.indexOf( messageId ) != -1 && this._multiSubList[i] !== undefined ) {
        for( var j = 0; j < this._multiSubList[i]['handlers'].length; j++ ) {
          if (this._multiSubList[i]['handlers'][j].isOnce){
            var dataIndex = this._multiSubList[i]['messageIds'].indexOf(messageId);
            if ( dataIndex != -1 ) this._multiSubList[i]['dataList'][dataIndex] = data;
            break;
          }
        }
      }
    }
  }

  var message = this.generate( messageId, data );
  if (this._storePub) {
    this._publishedMessages[messageId] = data;
  }  
  this._emitter.emit( messageId, message, data );
};

/**
 *  接收并处理一个消息，注意，handler不能是耗时很多的阻塞操作，若此种情况，可拆分多个
 *  @param {String} messageId 消息标识
 *  @param {Function} handler 消息处理函数
 *  @param {Boolean} isOnce 只监听一次，默认true
 *  @return {Boolean} 是否成功执行
 *  @example
 *    // 不止订阅一次
 *    app.sub( messageId, function( message, data ) { ... }, false );
 *    // 订阅多个消息，当消息全部完成时候回调handler，
 *    //此时会把各个消息的data依次作为handler参数传递
 *    app.sub([messageId1, [messageId2, [messageId3, [...]]]], handler, isOnce);
 *      handler = function( message, dataList ){ dataList[0] ... }
 */
Message.prototype.sub = function() {
  var app           = this;
  var isMultiSub    = false;
  var messageIds    = [];
  var messageIdsKey = '';
  var isOnce        = true;
  var lastArg       = arguments[arguments.length - 1];
  var handler       = null;
  var emitFn        = app._emitter.once;
  var needSub       = true;

  if ( typeof lastArg == 'function' ) {
    handler = lastArg;
    isMultiSub = arguments.length > 2 ? true : false;
  } else {
    isOnce  = lastArg;
    handler = arguments[arguments.length - 2];
    if ( typeof handler !== 'function' ) {
      app.pub( 'error', { 'file': __filename, 'err': 'prototype.sub handler is not a function.' });
      return;
    }
    isMultiSub = arguments.length > 3 ? true : false;
    if(isOnce === false) emitFn = app._emitter.on; 
  }

  for ( var i = 0; i < arguments.length; i ++ ) {
    if ( typeof arguments[i] == 'string' ) {
      messageIds.push( arguments[i] );
    }
  }
  // 如果是多个消息订阅
  if ( isMultiSub ) {
    messageIdsKey = messageIds.join(',');
    if ( app._multiSubList[messageIdsKey] === undefined ) {
      app._multiSubList[messageIdsKey] = {
        'messageIds':messageIds,
        'handlers':[ { 'handler':handler, 'isOnce':isOnce } ], 
        'dataList':[]
      };
    }
    // 若有多个协同订阅的回调，则除第一个外，不执行app._multiSubHandler，否则会重复绑定
    else {
      app._multiSubList[messageIdsKey]['handlers'].push( { 'handler':handler, 'isOnce':isOnce } );
      if ( app._storePub ) {
        var tmpDataList = [];
        messageIds.forEach(function(v, k){
          if ( app._publishedMessages[v] !== undefined ) {
            tmpDataList.push(app._publishedMessages[v]);
          }
        });
        if ( tmpDataList.length == messageIds.length ) handler(messageIdsKey, tmpDataList);
      }
      return;
    }
    handler = function( message, data ){
      app._multiSubHandler( messageIdsKey, message.id, data );
    };
  }
  // 订阅消息
  messageIds.forEach(function(messageId, k){
    var tmpData = app._publishedMessages[messageId]; 
    if (  tmpData !== undefined) {
      var message = app.generate( messageId, tmpData );
      handler( message, tmpData );
      if ( isOnce ) needSub = false;
    }
    if(needSub) {
      // this指向
      emitFn.call(app._emitter, messageId, handler);
    }
  });
};

/**
 * _multiSubHandler 多个协同订阅的处理
 * @param  {String} messageIdsKey 协同的消息ids
 * @param  {String} messageId      发布的消息id
 * @param  {Mixed} data     单个消息发布的数据内容
 */
Message.prototype._multiSubHandler = function( messageIdsKey, messageId, data ) {
  // 获取存储的协同订阅
  var multi = this._multiSubList[messageIdsKey];
  if ( !multi ) return;

  var msgIndex = multi['messageIds'].indexOf( messageId );
  if ( msgIndex != -1 ) {
    multi['dataList'][msgIndex] = data;
  }
  // 已经全部订阅到
  if ( multi['dataList'].length == multi['messageIds'].length ) {
    var app     = this;
    var message = app.generate(messageIdsKey, multi['dataList']); 
    multi['handlers'].forEach(function( handler, k ){
      handler['handler']( message, multi['dataList'] );
      // 判断重复订阅
      if ( handler['isOnce'] == true ) {
        multi['handlers'].splice( k, 1 );
      }
    });
    // 清空订阅的数据
    multi['dataList'] = [];
    if ( multi['handlers'].length == 0 ) {
      delete app._multiSubList[messageIdsKey];
    } 
  }
};

/**
 * 创建message对象在发布的时候传递标示
 * @param {String} messageId 消息id
 * @param {Mixed} data 发布的内容
 */
Message.prototype.generate = function( messageId, data ) {
  var message = { 
    'id'   :  messageId,
    'time' : (new Date).getTime()
  };
  return message;
};