// This file is to store the native JS custom functions , This should be included in the top of the imports
function fileType(input){
  var ext = input.split('.')[input.split('.').length -1]
  switch (ext) {
    case 'py':
      return 'python';
    case 'css':
      return 'css';
    case 'html':
        return 'html';
    case 'js':
        return 'javascript';
    default:
      return ''
  }
}

function isEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function dateToString(date){
  return date.getFullYear()+'-' + (date.getMonth()+1) + '-'+ (date.getDay());
}

var emptyFile = new File([""], "");

function daysInMonth(month,year) {
  return new Date(year, month, 0).getDate();
}

function getDays(month , year){
 //====== This function gives the dates of the month and the year in the array.
  var numDays = daysInMonth(month+1, year); // Number of days in the current month
  var numDaysPrev = daysInMonth(month, year); // Number of days in the current month
  var dTemp = new Date();
  dTemp.setFullYear(year, month, 1)
  var firstDay = dTemp.getDay();
  var dayFlags = [];
  var days = [];
  var dayFlag = "";
  var tFlag = 0;
  var start = numDaysPrev + 1 - firstDay;
  var temp = start;
  var toAdd = temp;
  if (temp>numDaysPrev){
    temp = 1;
    tFlag = 1;
  }
  for (var i= 0; i<42 ; i +=1) {
    if (tFlag==0){
      dayFlag = "Prev";
      toAdd = temp;
      temp +=1;
      if (temp>numDaysPrev){
        temp = 1;
        tFlag = 1;
      }
    }else if (tFlag ==1){
      dayFlag="Cur";
      toAdd = temp;
      temp +=1;
      if (temp > numDays){
        temp =1;
        tFlag = 2;
      }
    }else if (tFlag ==2){
      dayFlag = "Next";
      toAdd = temp;
      temp += 1;
    }
    days.push(toAdd);
    dayFlags.push(dayFlag);
  }
  return {days: days, flags : dayFlags};
};




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

scroll = function(element){
  var $id= $(element);
  $id.scrollTop($id[0].scrollHeight);
}

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

getType = function(input){
  // returns the type if the input
  if (typeof input == 'function') {
    return 'function';
  }

  if (isNumber(input)) {
    return  'number';
  }
  if (typeof input =='boolean' || input == null) {
    return 'string';
  }
  // console.log(str);
  if ( input.indexOf(' ') !=-1) {
    return 'string';
  }
  if (  input.length > 7) {

    input = input.toLowerCase()
    containesHTTP = (input.indexOf('http://') !=-1 || input.indexOf('https://') !=-1 );
    if ( containesHTTP ){
      if (input.endsWith('.jpg') || input.endsWith('png')) {
        type = 'image';
      }else if (input.endsWith('.pdf')) {
        type = 'pdf';
      }else if (input.endsWith('.py')) {
        type = 'python';
      }else if (input.endsWith('.odt')) {
        type = 'openDoc';
      }else{
        type = 'hyperLink';
      }
    } else{
      type = 'string'
    }
  } else {
    type = 'string';
  }
  return type;
}

String.prototype.endsWith = function(str){
  if (str.length<this){
    return false;
  }
  return (this.match(str+"$")==str)
}

getPK = function(input){
  // for any object url like /api/HR/uses/1/  : this can give the pk of the object
  if (typeof input == 'number') {
    return input;
  }
  parts = input.match(/\/\d*\//g);
  if (parts.length == 1) {
    return parseInt(parts[0].match(/\d+/));
  }
  return parseInt(input.match(/\/\d*\//g)[1].match(/\d+/))
}

String.prototype.cleanUrl = function(){
  return this.split('?')[0]
}
