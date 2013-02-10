/**
 * 包装原始的req对象
 * @param  {Object} oriReq 原始的request
 * @return {Object} 包装后的request
 */
exports.initReq = function( oriReq ){
  
  return {
    'ori':oriReq,

    'COOKIE':{},
    'SESSION':{},
    'HEADERS':{},
    'POST':{},
    'GET':{},
    'REQUEST':{},
    'FILES':{},
  };

};