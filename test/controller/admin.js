/**
 * 后台总控制器
 * @param {Objetc} app 某次请求
 */
module.exports.admin = function(app){
  
  if (!app.user_info) {
    app.end('access forbidden.');
    return;
  }
  app.pub('router.controller.admin.ok');
  
};