/**
 * 项目自身的初始化文件
 * 需要定义init方法供框架调用
 * 可初始化一些信息等
 */
module.exports.init = function(app, successCb) {
  

  //console.log(app.routes);
  //console.log(app._SESSION);
  //console.log(app._sessionid);

  // 解析用户信息
  app.helper('common').remember_me(app, function(err, user_info){
    successCb(err, user_info);
  });
};

