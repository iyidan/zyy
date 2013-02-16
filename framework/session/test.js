/**
 * test session
 */

var assert  = require('assert');
var test    = require('../test');

var Message = require('../message').Message;

function T()
{
  new Message(true, 50, this);

  var that = this;
  this.sub('abc', function(){
    console.log(this === that);
    console.log(this);
    console.log(that);
  });
  this.pub('abc');
}

var t = new T();


