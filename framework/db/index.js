/**
 * db连接模块
 */

var Message = require( '../message' ).Message;
var util         = require( 'util' );

var drivers = ['mysql'];

/**
 * DB构造器
 */
var DB = module.exports.DB = function(config)
{  
  var driver   = config.driver   || 'mysql';
  
  // pub & sub
  new Message(false, 50, this);

  // check driver
  if ( drivers.indexOf(driver) == -1 ) {
    this.pub('error', 'DB.driver is not supported.');
  }

  var Driver = require( './driver/' + driver )[driver];
  this.driver     = new Driver(this, config);
};

/**
 * query
 * @param  {String}   sql      [description]
 * @param  {Function} callback [description]
 */
DB.prototype.query = function(sql, callback) {
  this.driver.query(sql, callback);
};
