app.filter('rainbow' , function(){
  return function(input){
    // console.log(input);
    input +=1;
    if (input%10 == 1){
      return "bg-aqua";
    } else if (input%10 == 2){
      return "bg-yellow";
    } else if (input%10 == 3) {
      return "bg-orange";
    }else if (input%10 == 4) {
      return "bg-blue";
    }else if (input%10 == 5) {
      return "bg-green";
    } else if (input%10 == 6){
      return "bg-purple";
    } else if (input%10 == 7) {
      return "bg-red";
    }else if (input%10 == 8) {
      return "bg-black";
    }else if (input%10 == 9) {
      return "bg-olive";
    } else{
      return "bg-fuchsia";
    }
  }
})


app.filter('timeAgo' , function(){
  return function(input){
    t = new Date(input);
    var now = new Date();
    var diff = Math.floor((now - t)/60000)
    if (diff<60) {
      return diff+' Mins';
    }else if (diff>=60 && diff<60*24) {
      return Math.floor(diff/60)+' Hrs';
    }else if (diff>=60*24) {
      return Math.floor(diff/(60*24))+' Days';
    }
  }
})

app.filter('humanize' , function(){
  return function(input){
    // insert a space before all caps
    input = input.replace('_' , ' ');
    input = input.replace(/([A-Z])/g, ' $1');
    // uppercase the first character
    input = input.replace(/^./, function(str){ return str.toUpperCase(); });
    return input;
  }
})

app.filter('getIcon' , function(){
  return function(input){
    // console.log(scope.common);
    switch (input) {
      case 'LM':
        return 'fa-book';
      case 'PLM':
        return 'fa-square-o';
      case 'social':
        return 'fa-facebook-square';
      case 'payroll':
        return 'fa-money'
      default:
        return 'fa-bell-o';
    }
  }
})

app.filter('explodeObj' , function($filter){
  return function(input){

    if (typeof input =='object' && input!=null){
      toReturn = '';
      // console.log(input);
      for(key in input){
        val = input[key];
        if (val != null && typeof val !='object'){
          // console.log('The key is ' + key + ' and the value is ' + val);
          type = getType(val);
          // console.log(type);
          if ( type == 'hyperLink') {
            toReturn += '<a href=' + val + '> <i class="fa fa-link"></i> </a>';
          } else if (type == 'image') {
            toReturn += ' <i class="fa fa-picture-o"></i> ';
          } else if (type == 'pdf') {
            toReturn += ' <i class="fa fa-file-pdf-o"></i> ';
          } else if (type == 'odt') {
            toReturn += ' <i class="fa fa-file-text-o"></i> ';
          } else if(type == 'string') {
            if (angular.isDate(new Date(val))) {
              toReturn += $filter('date')(val , 'short');
            } else {
              toReturn += val + ' , ';
            }
          } else if(type == 'number') {
            toReturn += val + ' , ';
          } else{
            toReturn += type + ' , ';
          }
        } else{
          // console.log('The value is null for the key' + key);
          toReturn += '';
        }
      }
      // console.log(type);
      // console.log(toReturn);
      return toReturn;
    }else {
      type = getType(input);
      // console.log(urlTest);

      if ( type == 'hyperLink') {
        toReturn = '<a href=' + input + '> <i class="fa fa-link"></i> </a>';
      } else if (type == 'image') {
        toReturn =  ' <i class="fa fa-picture-o"></i> ';
      } else if (type == 'pdf') {
        toReturn =  ' <i class="fa fa-file-pdf-o"></i> ';
      } else if (type == 'odt') {
        toReturn =  ' <i class="fa fa-file-text-o"></i> ';
      } else if(type == 'string' ) {
        toReturn =  input ;
      } else if (!angular.isNumber(input) && angular.isDate(new Date(input))) {
        toReturn =  $filter('date')(input , 'short');
      } else { // generally a number 
        toReturn = input;
      }
      // console.log(type);
      // console.log(toReturn);
      return toReturn ;
    }
  }
})

app.filter('emailAddress' , function(){
  return function(input){
    if (typeof input == 'undefined') {
      return '';
    }
    parts = input.split(',');
    toReturn = '';
    for (var i = 0; i < parts.length; i++) {
      toReturn += parts[i].split('<')[0];
      if (i != parts.length-1) {
        toReturn += ' , ';
      }
    }
    return toReturn;
  }
})


app.filter('decorateCount' , function(){
  return function(input){
    if (input == 0 || typeof input == 'undefined'){
      return "";
    }
    else {
      return "("+input+")";
    }
  }
})

app.filter('getDP' , function(userProfileService){
  return function(input){
    if (typeof input == 'undefined' ) {
      return '/static/images/userIcon.png';
    }
    user = userProfileService.get(input);
    if (user.profile.displayPicture == null) {
      return '/static/images/userIcon.png';
    }else{
      return user.profile.displayPicture;
    }
  }
})


app.filter('getName' , function(userProfileService){

  return function(userUrl , mode){
    if (typeof userUrl == 'undefined') {
      return '';
    }
    user = userProfileService.get(userUrl);
    if (mode == 'short') {
      return user.first_name;
    }
    return user.first_name + ' ' + user.last_name;
  }
})
