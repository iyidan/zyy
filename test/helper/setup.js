/**
 * 项目自身的初始化文件
 * 需要定义init方法供框架调用
 * 可初始化一些信息等
 */

var common = require('./common');

module.exports.init = function(app) {
  

  console.log(app.routes);

  // 解析用户信息
  common.remember_me(app, function(err, user_info){
    app.pub('setup.ok');
  });
};

