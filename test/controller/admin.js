/**
 * 后台总控制器
 * @param {Objetc} app 某次请求
 */
module.exports.admin = function(app){
  //
  app.pub('error', 'test errorHandler');
  app.end('access forbidden.');
  //app.pub('router.controller.admin.ok');
};