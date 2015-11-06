app.filter('rainbow' , function(){
  return function(input){
    // console.log(input);
    input +=1;
    if (input%10 == 1){
      return "bg-aqua";
    } else if (input%10 == 2){
      return "bg-yellow";
    } else if (input%10 == 3) {
      return "bg-green";
    }else if (input%10 == 4) {
      return "bg-blue";
    }else if (input%10 == 5) {
      return "bg-orange";
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
      return diff+'M';
    }else if (diff>=60 && diff<60*24) {
      return Math.floor(diff/60)+'H';
    }else if (diff>=60*24) {
      return Math.floor(diff/(60*24))+'D';
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
      case 'Social':
        return 'fa-facebook-square';
      case 'Payroll':
        return 'fa-money'
      default:
        return 'fa-bell-o';
    }
  }
})

app.filter('explodeObj' , function(){
  return function(input){
    if (typeof input =='object' && input!=null){
      toReturn = '';
      // console.log(input);
      for(key in input){
        val = input[key];
        if (val != null && typeof val !='object'){
          // console.log('The key is ' + key + ' and the value is ' + val);
          urlTest = isUrl(val);
          // console.log(urlTest);
          if ( urlTest.type == 'hyperLink') {
            toReturn += '<a href=' + val + '> <i class="fa fa-link"></i> </a>';
          } else if (urlTest.type == 'image') {
            toReturn += ' <i class="fa fa-picture-o"></i> ';
          } else if (urlTest.type == 'pdf') {
            toReturn += ' <i class="fa fa-file-pdf-o"></i> ';
          } else if (urlTest.type == 'odt') {
            toReturn += ' <i class="fa fa-file-text-o"></i> ';
          } else if(urlTest.type == 'string') {
            toReturn += val + ' , ';
          } else if(urlTest.type == 'number') {
            toReturn += val + ' , ';
          } else{
            toReturn += urlTest.type + ' , ';
          }
        } else{
          // console.log('The value is null for the key' + key);
          toReturn += '';
        }
      }
      return toReturn;
    }else {
      urlTest = isUrl(input);
      // console.log(urlTest);
      if ( urlTest.type == 'hyperLink') {
        return '<a href=' + input + '> <i class="fa fa-link"></i> </a>';
      } else if (urlTest.type == 'image') {
        return ' <i class="fa fa-picture-o"></i> ';
      } else if (urlTest.type == 'pdf') {
        return ' <i class="fa fa-file-pdf-o"></i> ';
      } else if (urlTest.type == 'odt') {
        return ' <i class="fa fa-file-text-o"></i> ';
      } else if(urlTest.type == 'string' || urlTest.type == 'number') {
        return input ;
      } else{
        return input ;
      }
    }
  }
})

app.filter('decorateCount' , function(){
  return function(input){
    if (input ==1){
      return "";
    }
    else {
      return "("+input+")";
    }
  }
})

app.filter('getDP' , function(userProfileService){
  return function(userUrl){
    if (typeof userUrl == 'undefined') {
      return ;
    }
    user = userProfileService.get(userUrl);
    return user.profile.displayPicture;
  }
})


app.filter('getName' , function(userProfileService){
  return function(userUrl){
    if (typeof userUrl == 'undefined') {
      return '';
    }
    profile = userProfileService.get(userUrl);
    return profile.first_name + ' ' + profile.last_name;
  }
})
