// This file is to store the native JS custom functions , This should be included in the top of the imports

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

getPK = function(input){
  // for any object url like /api/HR/uses/1/  : this can give the pk of the object
  return parseInt(input.match(/\/\d*\//g)[1].match(/\d+/))
}

String.prototype.cleanUrl = function(){
  return this.split('?')[0]
}
