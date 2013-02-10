/**
 * 包装原始的req对象
 * @param  {Object} oriRes 原始的request
 * @return {Object} 包装后的request
 */
exports = function( oriRes ){
  return Object.create(oriRes, {
    'ori':oriRes
  });
};