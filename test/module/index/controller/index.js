/**
 * 控制器
 */

////////////////////////////////////////////////////////
//
// return {String, Object, Array, Boolean}
// ajax:   如果返回字符串，则输出{info:str}
//         如果返回对象，则输出json格式的字符串
//         如果返回布尔值，则不操作
// 非ajax：如果返回字符串，则输出提示信息，类型为info
//         如果返回Array,[msgType, msg, redirectUrl]
//         
/////////////////////////////////////////////////////////


/**
 * [Action 控制器构造器]
 * @param {Object} app 具体的一次http请求响应
 */
var actions = module.exports;

/**
 * __call 如果没有指定的action则访问此方法
 */
actions.__call = function(app, action, params)
{
  app.assign('names', ['__call', 'bar', 'baz']);
  app.display('test.html');
};

/**
 * 默认方法，若没有控制器则会访问此方法
 */
actions.index = function(app)
{
  app.assign('names', ['index', 'bar', 'baz']);
  app.display('test.html');
};