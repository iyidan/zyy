/**
 * mysql
 */

var mysql = require('../../../3rd/mysql');

module.exports.mysql = function( db, config )
{  
  this._db    = db;
  //this.pool   = mysql.createPool(config); 
  this.config = config;
};

/* 原型 */
var pro = module.exports.mysql.prototype;

/* 只实现这个方法 */
pro.query = function (sql, callback)
{
  sql = this.checkSql(sql);

  var mysqlWr = this;
  /*this.pool.getConnection(function(err, connection){
    if (err) {
      mysqlWr._db.pub('error', err);
      return;
    }
    connection.query(sql, function(err, data){
      connection.end(function(endErr){
        callback(err, data, endErr);  
      });
    });
  });*/
  var connection = mysql.createConnection(mysqlWr.config);
  connection.connect(function(err) {
    if (err) {
      mysqlWr.pub('error', err);
      return;
    }
  });
  connection.query(sql, callback);
  connection.end();
};

pro.checkSql = function(sql) {
  return sql;
};