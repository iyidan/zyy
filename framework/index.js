/**
 * 创建一个http服务器
 * @param {Object} config 项目配置
 * @param {Function} callback 
 *     某个http请求被框架初始化后的回调函数
 *     可以做一些项目自有的特殊需求
 *     可不传递
 * @return {Object} 返回有http.createServer 生成的server实例
 */
exports.createServer = init.createServer;
