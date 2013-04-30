/**
 * db连接模块
 */

var Message = require( '../message' ).Message;

var drivers = ['mysql', 'redis'];

/**
 * DB构造器
 */
var DB = module.exports.DB = function(config)
{  

  // pub & sub
  new Message(false, 50, this);

  var driver   = config.DB.driver || 'mysql';
  
  if ( !config.DB.ps ) {
    config.DB.ps = config.PROJECT_NAME;
  }

  // check driver
  if ( drivers.indexOf(driver) == -1 ) {
    this.pub('error', 'DB.driver is not supported.');
  }

  var Driver = require( './driver/' + driver )[driver];
  this.driver     = new Driver(this, config.DB);

  return this.driver;
};