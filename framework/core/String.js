
/**
 * 获取一个字符串的hash值，区分大小写
 * 采用JSHash
 * @see http://www.byvoid.com/blog/string-hash-compare/
 */
Object.defineProperty( String.prototype, 'hash', {
  enumerable: false,
  value: function(){
    var hash = 1315423911, i, ch;
    for (i = this.length - 1; i >= 0; i--) {
        ch = this.charCodeAt(i);
        hash ^= ((hash << 5) + ch + (hash >> 2));
    }
    return  (hash & 0x7FFFFFFF);  
  }
});