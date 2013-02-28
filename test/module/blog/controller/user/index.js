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
 * __call 如果没有指定的action则访问此方法
 */
actions.__call = function(action)
{
  this.app.assign('names', ['blog/user/__call:'+action, 'bar', 'baz']);
  this.app.display('tpl.ejs');
};

/**
 * 默认方法，若没有控制器则会访问此方法
 */
actions.add = function()
{
  this.app.assign('names', ['blog/user/add', 'bar', 'baz']);
  this.app.display('tpl.ejs');
};

actions.test = function()
{
  this.app.assign('names', ['blog/user/test', 'bar', 'baz']);
  this.app.display('tpl.ejs');
};