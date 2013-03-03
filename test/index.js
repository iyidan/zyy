var config  = require( './config' ).config;
var Framework  = require( config.FW_PATH );
var util    = require( 'util' );
var utils   = require(config.FW_PATH + '/core/utils.js' );
var Message = require(config.FW_PATH + '/message').Message;

var server = Framework.createServer(config , function(message, app){
  console.log(app.routes);
});