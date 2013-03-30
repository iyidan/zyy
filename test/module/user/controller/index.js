/**
 * 默认控制器
 */

/**
 * [Controller 控制器构造器]
 * 可用于一些初始化
 */
var Controller = module.exports.Controller = function(app)
{
  this.app = app;
  //this.user = ...;
};

/**
 * 在prototype上定义action
 */
var actions = Controller.prototype;

/**
 * 默认方法，若没有控制器则会访问此方法
 */
actions.__call = function()
{

  if ( this.app.user_info ) {
    
    this.app.assign('title', '个人主页');
    this.app.assign('user_info', this.app.user_info);

    this.app.display('profile.html');
    return;
  }

  this.app.assign('title', '用户登录');
  this.app.display('login.html');
};

actions.login = function() {

  if (this.app.user_info) {
    return this.app.redirect('/user');
  }

  var username = this.app.utils.trim(this.app.POST('username', ''));
  var password = this.app.utils.trim(this.app.POST('password', ''));
  if (!username || !password) {
    return this.app.end('username or password is empty.');
  }

  var that = this;

  this.app.db.query('SELECT * FROM `user` WHERE `user_name` = "'+username+'" LIMIT 1', function(err, user_info){
    if (err){
      that.app.pub('error', err);
      return;
    }
    if ( !user_info || user_info.status != 1 ) {
      console.log(username, user_info);
      return that.app.end('user not found.');
    }
    if ( that.app.utils.md5(password) != user_info.password ) {
      return that.app.end('user password is not correct.');
    }
    var com = require(that.app.config.ROOT_PATH + '/helper/common');
    
    com.remember_me(that.app, function(err){
      if (err) {
        return that.app.pub('error', err);
      }
      that.redirect('/user');
    });
  });
};