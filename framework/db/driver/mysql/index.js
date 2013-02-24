/**
 * mysql
 */

var mysql = require('../../3rd/mysql');

module.exports.mysql = function( db, config )
{  
  this._db = db;

  var host     = config.host || 'localhost';
  var port     = config.port || 3306;
  var user     = config.user;
  var password = config.password;
  var database = config.database;
  
  if ( !user || !password || !database ) {
    db.pub('error', 'in DB.driver mysql config is empty.');
  }

  this.pool = mysql.createPool({
    host     : host,
    port     : port
    user     : user,
    password : password,
    database : database
  }); 
};

/* 原型 */
var pro = module.exports.mysql.prototype;

/* 只实现这个方法 */
pro.query = function (sql, callback)
{
  sql = this.checkSql(sql);

  var mysqlWr = this;
  this.pool.getConnection(function(err, connection){
    if (err) {
      mysqlWr._db.pub('error', err);
      return;
    }
    connection.query(sql, function(err, data){
      connection.end();
      callback(err, data);
    });
  });
};

pro.checkSql = function(sql) {
  return sql;
};