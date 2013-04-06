var config  = require( './config' ).config;
var Framework  = require( config.FW_PATH );
var utils   = require(config.FW_PATH + '/core/utils.js' );
var Message = require(config.FW_PATH + '/message').Message;

var server = Framework.createServer(config , function(errType, err, app){
  if ( errType == 'app.error' ) {
    if ( app.config.ONDEV ) {
      app.setStatusCode(200);
      app.end( 'request error: ' + utils.inspect( err, true ) );
    } else {
      app.setStatusCode(200);
      app.end('request error.');
    }
  } else if ( errType == 'db.error' ) {
    console.log(err);
  } else if ( errType == 'session.error' ) {
    console.log(err);
  } else if ( errType == 'template.error' ) {
    app.end( 'template render error: ' + utils.inspect( err, true ) );
  }
});