
var Test = module.exports.Test = function() {
  this.tests        = [];
  this.jobStartTime = null;
  this.jobEndTime   = null;
  this.startTime    = null;
  this.endTime      = null;
};

Test.prototype.suite = function( str ) {
  str = ( '[' + str + '] =======================================').slice(0, 80);
  console.log('\n' + str + '\n');
};

Test.prototype.test = function(title, cb) {
  this.tests.push([title, cb]);
}

Test.prototype.next = function() {
  
  if(this.jobStartTime) {
    this.jobEndTime = (new Date).getTime();
    console.log('\njob costs time ' + (this.jobEndTime - this.jobStartTime) + ' ms');
  } 

  if ( this.tests.length == 0) {

    this.suite('test all over');
    this.endTime = (new Date).getTime();
    console.log('costs time '+ (this.endTime - this.startTime) + ' ms');
    return;
  }

  if (!this.startTime) this.startTime = (new Date).getTime();

  var job = this.tests.shift();
  
  this.suite(job[0]);
  
  this.jobStartTime = (new Date).getTime();

  // 执行job
  job[1]();

};