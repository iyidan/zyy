/**
 * mysql
 */

var mysql = require('../../../3rd/mysql');

module.exports.mysql = function( db, config )
{  
  this._db    = db;
  this.pool   = mysql.createPool(config); 
  this.config = config;
  
  this._name = 'mysql';
};

/* 原型 */
var pro = module.exports.mysql.prototype;

/**
 * 查询一条sql
 * @param  {[type]}   sql      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
pro.query = function (sql, callback)
{
  sql = this.checkSql(sql);

  var mysqlWr = this;
  this.pool.getConnection(function(err, connection){
    if (err) {
      mysqlWr._db.pub('error', err);
      return;
    }
    // handler disconnect
    mysqlWr.handleDisconnect(connection);
    // query
    connection.query(sql, function(err, data){
      callback(err, data);
      connection.end(function(endErr){
       if (endErr) {
        mysqlWr._db.pub('error', endErr);
       }   
      });
    });
  });
};

/**
 * 检查sql
 * @param  {[type]} sql [description]
 * @return {[type]}     [description]
 */
pro.checkSql = function(sql) {
  return sql;
};

/**
 * 监听connection error事件
 * @param  {[type]} connection [description]
 * @return {[type]}            [description]
 */
pro.handleDisconnect = function(connection) {
  if (connection._bindOnError) return;
  connection._bindOnError = true;
  var mysqlWr = this;
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }
    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      mysqlWr._db.pub('error', err);
      return;
    }
  });
}