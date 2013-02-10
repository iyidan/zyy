Object.prototype.clone = function(){
  var newObj = {};
    for ( var i in this ) {
      var typei = type this[i];
      if ( typei == 'object' || typei == 'function' ) {
        newObj[i] = this[i].clone();
      } else {
        newObj[i] = this[i];
      }
    }
    return newObj;
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
        this[j] = arguments[i][j].clone();
      } else {
        this[j] = arguments[i][j];  
      }
    }
  }
  return this;
};