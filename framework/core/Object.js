/**
 * 利用JSON来克隆一个数据对象
 * @return {Object} 
 */
Object.prototype.clone = function(){
  var json = JSON.stringify(this);
  console.log(json, this);
  //return JSON.parse(json);
  return {};
};

/**
 * 合并多个对象，深层的会clone
 * @return {Object} 
 * @example
 *   var obj1 = {a:1};
 *   obj1 = obj1.merge(obj2, [Object obj3, [Object obj4, [...]]]);
 */
Object.prototype.merge = function() {
  var argLength = arguments.length;
  if ( argLength == 0 ) {
    return this;
  }

  for ( var i = 0; i < argLength; i++ )  {
    if ( typeof arguments[i] != 'object' ) {
      continue;
    }
    for ( var j in arguments[i] ) {
      var typej = typeof arguments[i][j];
      if ( typej == 'object' || typej == 'function' ) {
        console.log('merge j: '+ j);
        this[j] = arguments[i][j].clone();
      } else {
        this[j] = arguments[i][j];  
      }
    }
  }
  return this;
};