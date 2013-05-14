/**
 * 创建一个http服务器
 * @param {Object} config 项目配置
 * @param {Function} errorHandler 
 *     错误处理函数
 * @return {Object} 返回由http.createServer 生成的server实例
 */

var init = require('./init');
exports.createServer = init.createServer;
