module.exports = {

  suite: function( str ) {
    str = (str + ' =======================================').slice(0, 40);
    console.log('\n' + str + '\n');
  },

  test: function( str, callback ) {
    console.log( '\n[' + str + ']\n' );
    try {
      callback();
      console.log('ok\n');
    } catch (e) {
      console.log(e.toString() + '\n' );
    }
  }
};