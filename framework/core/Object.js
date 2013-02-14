
/**
 * 利用JSON来克隆一个数据对象，不能克隆方法[Function]
 * @return {Object} 
 */
Object.defineProperty( Object.prototype, 'clone', {
  enumerable: false,
  value: function(){
    if ( typeof this == 'object' ) {
      var json = JSON.stringify(this);  
      return JSON.parse(json);
    }
    return undefined;  
  }
});

/**
 * 合并多个对象，深层的会clone
 * @return {Object} 
 * @example
 *   var obj1 = {a:1};
 *   obj1 = obj1.merge(obj2, [Object obj3, [Object obj4, [...]]]);
 */
Object.defineProperty( Object.prototype, 'merge', {
  enumerable: false,
  value: function() {
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
        if ( typej == 'object' && arguments[i].hasOwnProperty(j) ) {
            this[j] = arguments[i][j].clone();  
        } else if ( typej != 'function' ) {
          this[j] = arguments[i][j];  
        }
      }
    }
    return this;
  }
});