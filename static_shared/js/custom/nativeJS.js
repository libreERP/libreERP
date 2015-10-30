// This file is to store the native JS custom functions , This should be included in the top of the imports
Array.prototype.sortIndices = function (func) {
  var i = j = this.length,
    that = this;

  while (i--) {
    this[i] = { k: i, v: this[i] };
  }

  this.sort(function (a, b) {
    return func ? func.call(that, a.v, b.v) :  a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
  });

  while (j--) {
      this[j] = this[j].k;
  }
}

range = function(min, max, step){
  step = step || 1;
  var input = [];
  for (var i = min; i <= max; i += step) input.push(i);
  return input;
};



function isNumber(num){
  if (typeof num=='string') {
    num = parseInt(num);
  }
  // console.log(num);
  // console.log(Number.isInteger(num));
  if (Number.isInteger(num)){
    return true;
  }else {
    return false;
  }
}

isUrl = function(str){
  // checks if the input is a url
  if (isNumber(str)) {
    return {flag : false , type : 'number'};
  }
  if (typeof str =='boolean' || str == null) {
    return {flag : false , type : 'string'};
  }
  // console.log(str);
  if ( str.indexOf(' ') !=-1) {
    return {flag : false , type : 'string'};
  }
  if (  str.length > 7) {

    str = str.toLowerCase()
    containesHTTP = (str.indexOf('http://') !=-1 || str.indexOf('https://') !=-1 );
    if ( containesHTTP ){
      flag = true;
      if (str.endsWith('.jpg') || str.endsWith('png')) {
        type = 'image';
      }else if (str.endsWith('.pdf')) {
        type = 'pdf';
      }else if (str.endsWith('.py')) {
        type = 'python';
      }else if (str.endsWith('.odt')) {
        type = 'openDoc';
      }else{
        type = 'hyperLink';
      }
    }
  } else {
    flag = false;
    type = 'string';
  }
  return {flag : flag , type : type};
}

String.prototype.endsWith = function(str){
  if (str.length<this){
    return false;
  }
  return (this.match(str+"$")==str)
}
