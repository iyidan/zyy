/**
 * 包装原始的req对象
 * @param  {Object} oriReq 原始的request
 * @return {Object} 包装后的request
 */
exports = function( oriReq ){
  return Object.create(oriReq, {
    'ori':oriReq
  });
};