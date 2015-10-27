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

var ngCIOC = angular.module('libreHR.directives' , []);

ngCIOC.service('userProfileService', function($rootScope, $window){
  var userProfiles = [];
  var userSocialPosts = [];
  var userSocialAlbums = [];
  var userSocialPictures = [];
  if (typeof userProfiles["mySelf"]=="undefined") {
    var result = myProfile();
    user = result.user;
    userProfiles["mySelf"]={ url:result.url.split("?")[0],  name: user.first_name+" "+user.last_name ,social : user.profile , email : user.email , username :user.username};
    // console.log(user);
  }

  $window.rootScopes = $window.rootScopes || [];
  $window.rootScopes.push($rootScope);

  if (!!$window.sharedService){
    return $window.sharedService;
  }

  $window.sharedService = {
    change: function(input){
      // do something with the input such as assigning it back to the variable
      angular.forEach($window.rootScopes, function(scope) {
        if(!scope.$$phase) {
            scope.$apply();
        }
      });
    },
    get: function(userUrl){
      if (typeof userProfiles[userUrl]=="undefined") {
        var user = getUser(userUrl);
        // console.log("going to GET");
        // console.log(user);
        userProfiles[userUrl]={url: userUrl, name: user.first_name+" "+user.last_name , social : user.profile , email : user.email, username :user.username};
      }
      // console.log(userUrl);
      return userProfiles[userUrl];
    },
    social: function(username , item){
      // console.log("came in the get function of the userSocialProfileService");
      if (item == "post") {
        if (typeof userSocialPosts[username]=="undefined") {
          var posts =  getSocialContent(username , 'Post');
          userSocialPosts[username]=posts;
        }
        return userSocialPosts[username];

      }else if (item == "pictures") {

        if (typeof userSocialPictures[username]=="undefined") {
          var pictures = getSocialContent(username , 'Picture');
          userSocialPictures[username]=pictures;
        }
        return userSocialPictures[username];
      }else if (item == "albums") {
        if (typeof userSocialAlbums[username]=="undefined") {
          var albums =  getSocialContent(username , 'Album');
          userSocialAlbums[username]=albums;
        }
        return userSocialAlbums[username];
      }
    },

  }

  // $window.sharedService.social('pradeep' , 'posts');
  return $window.sharedService;
});

ngCIOC.filter('rainbow' , function(){
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

ngCIOC.directive('modal', function () {
  return {
    template: '<div class="modal fade">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
              '<h4 class="modal-title">{{ title }}</h4>' +
            '</div>' +
            '<div class="modal-body">'+
              '<div ng-include="contentUrl"></div>'+
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
      visible : '=',
      submitFn :'&',
    },
    controller : function($scope){
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {
      scope.title = attrs.title;
      scope.contentUrl = attrs.url;
      scope.$watch('visible', function(newValue , oldValue){
        if(newValue == true){
          $(element).modal('show');
        }
        else{
          $(element).modal('hide');
        }
      });

      $(element).on('shown.bs.modal', function(){
        scope.$apply(function(){
          scope.visible = true;
        });
      });

      $(element).on('hidden.bs.modal', function(){
        scope.$apply(function(){
          scope.data.statusMessage = '';
          scope.visible = false;
        });
      });
    }
  };
});

ngCIOC.filter('timeAgo' , function(){
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

ngCIOC.filter('humanize' , function(){
  return function(input){
    // insert a space before all caps
    input = input.replace('_' , ' ');
    input = input.replace(/([A-Z])/g, ' $1');
    // uppercase the first character
    input = input.replace(/^./, function(str){ return str.toUpperCase(); });
    return input;
  }
})

ngCIOC.filter('getIcon' , function(){
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

ngCIOC.filter('getDP' , function(userProfileService){
  return function(userUrl){
    user = userProfileService.get(userUrl);
    return user.social.displayPicture;
  }
})


ngCIOC.filter('getName' , function(userProfileService){
  return function(userUrl){
    profile = userProfileService.get(userUrl);
    return profile.name;
  }
})

ngCIOC.filter('explodeObj' , function(userProfileService){
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

ngCIOC.filter('decorateCount' , function(){
  return function(input){
    if (input ==1){
      return "";
    }
    else {
      return "("+input+")";
    }
  }
})

ngCIOC.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

ngCIOC.service('ngHttpSocket', ['$http', function ($http) {
  this.uploadFileToUrl = function(data, uploadUrl){

    $http.post(uploadUrl, data, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
    .success(function(){
    })
    .error(function(){

    });
  }
}]);


/*
This directive allows us to pass a function in on an enter key to do what we want.
 */

ngCIOC.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});


function getUser(urlGet , mode){
  // console.log(urlGet);
  var httpRequest = new XMLHttpRequest()
  if (urlGet.indexOf('json')==-1) {
    urlGet += '?format=json';
  }
  httpRequest.open('GET', urlGet , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    // console.log(urlGet);
    user = JSON.parse(httpRequest.responseText);
    user.myUrl = urlGet;
    return user
  }
}

function myProfile(){
  var httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', "/api/users/?mode=mySelf&format=json" , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    var temp = JSON.parse(httpRequest.responseText);
    // console.log(temp[0].url);
    return {user :getUser(temp[0].url , "mySelf") , url:temp[0].url};
  }
}

function getSocialContent(username, mode){
  var httpRequest = new XMLHttpRequest();
  // console.log(mode);
  var urlStr = '/api/social'+mode+'/?format=json&user='+ username;
  httpRequest.open('GET', urlStr , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    // console.log("returning from the getSocialContent");
    return JSON.parse(httpRequest.responseText);
  }
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
