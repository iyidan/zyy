/**
 * 解析请求体模块
 */

var formidable = require('../3rd/formidable');
var utils      = require('../core/utils.js');

/* formidable 支持的类型 */
var ctR = /(octet\-stream)|(urlencoded)|(multipart)|(json)/i;

/**
 * 解析body
 * @param  {Object} app  [description]
 * @param  {Object} conf [description]
 */
module.exports.parseBody = function(app, conf)
{
  var ct = app.SERVER('headers')['content-type'];
  var cl = parseInt(app.SERVER('headers')['content-length'], 10) || 0;

  // 由formidable解析
  // ----------------
  if ( ctR.test(ct) ) {
    var form = new formidable.IncomingForm(conf);
    // handle error event
    form.on( 'error', function( err ){
      app.pub( 'error', {
        'file': __filename,
        'err': err
      });
    });
    form.parse( app.req, function(err, fields, files) {
      app.pub( 'app.body.parse.ready', {
        'err'    : err,
        'fields' : fields,
        'files'  : files
      });
    });

  // 接收原始数据
  // ------------
  } else if (cl > 0) {
    var bfh = new utils.BufferHelper();
    app.req
    .on('error', function(err) {
      app.pub( 'error', {
        'file': __filename,
        'err': err
      });
    })
    .on('aborted', function() {
      app.pub( 'error', {
        'file': __filename,
        'err': new Error('Request aborted')
      });
    })
    .on('data', function(buffer) {
      bfh.add(buffer);
    })
    .on('end', function() {
      app._oriBody = bfh.toString();
      app.pub('app.body.parse.ready');
    });

  // cl <=0
  // ------
  } else {
    app.pub('app.body.parse.ready');
  }
};