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
 * 在路由 new Controller调用，如果定义了则会调用
 * @param {Object} app  具体的一次http请求
 * @param {Function} callback 若定义__construct 必须调用callback请求才能继续
 */
actions.__construct = function(app, callback)
{
  this.startTime = (new Date).getTime();  
  callback();
};

/**
 * 访问不存在的方法调用
 * @param  {Object} app    具体的一次http请求
 * @param  {String} action 请求的方法名
 * @param  {Array} params 参数
 */
actions.__call = function(app, action, params)
{
  if ( app.user_info ) {
    app.assign('title', '个人信息');
    app.assign('user_info', app.user_info);
    app.display('profile.html');
  } else {
    app.assign('title', '请先登录');
    app.display('login.html');
  }
};

/**
 * 登录
 * @param {Object} app 具体的一次http请求
 * @return {[type]} [description]
 */
actions.login = function(app) {

  if (app.user_info) {
    app.redirect('/user');
    return false;
  }

  var username = app.utils.trim(app.POST('username', ''));
  var password = app.utils.trim(app.POST('password', ''));
  if (!username || !password) {
    return 'username or password is empty.';
  }

  // 异步获取数据
  var that = this;
  app.db.query('SELECT * FROM `user` WHERE `user_name` = "'+username+'" LIMIT 1', function(err, user_info){
    if (err){
      app.pub('error', err);
      return;
    }
    
    user_info = user_info ? user_info[0] : user_info;
    if ( !user_info || user_info.status != 1 ) {
      return app.end('user not found.');
    }
    if ( app.utils.md5(password) != user_info.password ) {
      return app.end('user password is not correct.');
    }

    app.user_info = user_info;

    app.helper('common').remember_me(app, function(err){
      if (err) {
        return app.pub('error', err);
      }
      app.redirect('/user');
    });

  });
};

/**
 * 登出
 * @param  {[type]} app [description]
 */
actions.logout = function(app) {
  app.helper('common').remember_me_expires(app);
  return 'ok';
};