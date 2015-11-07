app.directive('breadcrumb', function () {
  return {
    templateUrl: '/breadcrumb.html',
    restrict: 'E',
    replace: true,
    scope: false,
    controller : function($scope , $state){
      var stateName = $state.current.name;
      $scope.stateParts = stateName.split('.');
    },
  };
});

app.directive('profileEditor', function () {
  return {
    templateUrl: '/profileEditor.html',
    restrict: 'E',
    replace: true,
    scope: {
      objUrl :'=',
    },
    controller : function($scope , $http , userProfileService){
      $scope.userUrl = angular.copy($scope.objUrl);
      user = userProfileService.get($scope.userUrl);
      $scope.userUrl = $scope.userUrl.replace('users' , 'profileAdminMode');
      $scope.resourceUrl = '/api/HR/profileAdminMode';
      $scope.formTitle = 'Edit Profile for ' + user.first_name + ' ' + user.last_name;
      emptyFile = new File([""], "");
      method = 'options';
      $http({method :method , url : $scope.resourceUrl}).
      then(function(response){
        $scope.profileFormStructure = response.data.actions.POST;
        $http({method :'GET' , url : $scope.userUrl}).
        then(function(response){
          $scope.profile = response.data;
          for(key in $scope.profileFormStructure){
            if ($scope.profileFormStructure[key].type.indexOf('upload') !=-1) {
              $scope.profile[key] = emptyFile;
            }
          }
          $scope.profileUrl = $scope.profile.url.replace('profile' , 'profileAdminMode')
        } , function(response){});
      }, function(response){});

      $scope.updateProfile = function(){
        console.log("Going to submit the profile data");
        console.log($scope.profile);
        var fd = new FormData();
        for(key in $scope.profile){
          if (key!='url' && $scope.profile[key] != null) {
            if ($scope.profileFormStructure[key].type.indexOf('integer')!=-1 ) {
              if ($scope.profile[key]!= null) {
                fd.append( key , parseInt($scope.profile[key]));
              }
            }else if ($scope.profileFormStructure[key].type.indexOf('date')!=-1 ) {
              if ($scope.profile[key]!= null) {
                fd.append( key , $scope.profile[key]);
              }
            }else if ($scope.profileFormStructure[key].type.indexOf('url')!=-1 && ($scope.profile[key]==null || $scope.profile[key]=='')) {
              // fd.append( key , 'http://localhost');
            }else{
              fd.append( key , $scope.profile[key]);
            }
          }
        }
        $http({method : 'PATCH' , url : $scope.profileUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
        then(function(response){
          $scope.statusMessage = "Posted";
          $scope.httpStatus = 'success';
          setTimeout(function () {
            $scope.statusMessage = '';
            $scope.httpStatus = '';
            $scope.$apply();
          }, 4000);
        },function(response){
          $scope.httpStatus = 'danger';
          $scope.statusMessage = response.status + ' : ' + response.statusText;
          setTimeout(function () {
            $scope.statusMessage = '';
            $scope.httpStatus = '';
            $scope.$apply();
          }, 4000);
        });
      }
    },
  };
});

app.directive('fileModel', ['$parse', function ($parse) {
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

/*
This directive allows us to pass a function in on an enter key to do what we want.
 */

app.directive('ngEnter', function () {
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

app.directive('genericForm', function () {
  return {
    templateUrl: '/genericForm.html',
    restrict: 'E',
    replace: true,
    scope: {
      template : '=',
      submitFn : '&',
      data :'=',
      objUrl : '=',
      formTitle : '=',
      wizard : '=',
      maxPage : '=',
    },
    controller : function($scope , $state){
      $scope.page = 1;
      $scope.next = function(){
        $scope.page +=1;
        if ($scope.page>$scope.maxPage) {
          $scope.page = $scope.maxPage;
        }
      }
      $scope.prev = function(){
        $scope.page -=1;
        if ($scope.page<1) {
          $scope.page = 1;
        }
      }
    },
  };
});

app.directive('genericTable', function () {
  return {
    templateUrl: '/static/ngTemplates/genericTable/genericSearch.html',
    restrict: 'E',
    transclude: true,
    replace: false,
    scope: {
      tableData :'=',
      resourceUrl : '=',
      primarySearchField : '=',
      callbackFn : '=',
      views : '=',
      graphTemplate : '=',
      options : '=',
      multiselectOptions : '=',
      search : '=',
      getParams :'=',
    },
    controller : function($scope , $http, $templateCache, $timeout , userProfileService , $aside) {
      $scope.tableData = [];
      $scope.searchText = '';
      $scope.originalTable = [];
      $scope.itemsNumPerView = [5, 10, 20];
      $scope.itemsPerView = 5;
      $scope.pageList = [1];
      $scope.pageNo = 1; // default page number set to 0
      $scope.viewMode = 'list';
      $scope.numOfPagesPerView = 5;
      $scope.viewMode = 0;

      if ( typeof $scope.multiselectOptions == 'undefined' || $scope.multiselectOptions.length ==0 ) {
        $scope.isSelectable = false;
      } else {
        $scope.isSelectable = true;
      }

      if ( typeof $scope.options == 'undefined' || $scope.options.length ==0 ) {
        $scope.haveOptions = false;
      } else {
        $scope.haveOptions = true;
      }
      if ( typeof $scope.search == 'undefined' || $scope.search  ) {
        $scope.searchShow = true;
      } else {
        $scope.searchShow = false;
      }

      $scope.$watch('tableData' , function(newValue , oldValue){
        $scope.selectStates = [];
        if ($scope.isSelectable) {
          for (var i = 0; i < $scope.tableData.length; i++) {
            $scope.selectStates.push({value : false , disabled : false});
          }
        }
      });


      $scope.changeView = function(mode){
        $scope.viewMode = mode;
      }
      $scope.multiSelectAction = function(action){
        items = [];
        for (var i = 0; i < $scope.selectStates.length; i++) {
          if ($scope.selectStates[i].value == true) {
            items.push($scope.tableData[i].url);
          }
        }
        $scope.callbackFn(items , action , 'multi')
      };

      $scope.fullTextSearch = function(str){
        rowsContaining = [];
        str = str.toLowerCase();
        // console.log(str);
        for (var i = 0; i < $scope.originalTable.length; i++) {

          row = $scope.originalTable[i];
          for (key in row){
            val = row[key].toString().toLowerCase();
            if (val.indexOf(str) !=-1){
              rowsContaining.push(i)
              break;
            };
            rowNested = row[key];
            if (typeof rowNested == 'object') {
              for (keyNested in rowNested){
                if (rowNested[keyNested] != null) {
                  valNested = rowNested[keyNested].toString().toLowerCase();
                  if (valNested.indexOf(str) !=-1){
                    if (rowsContaining.indexOf(i) == -1) {
                      rowsContaining.push(i)
                      break;
                    }
                  };
                }
              };
            }
          };
        } // main for loop

        $scope.tableData = [];
        for (var i = 0; i < rowsContaining.length; i++) {
          $scope.tableData.push($scope.originalTable[rowsContaining[i]]);
        }
      }
      $scope.fetchData = function(searchStr){
        if (typeof searchStr=='undefined') {
          searchStr = '';
        }
        fetch.method = 'GET';
        if (typeof $scope.primarySearchField == 'undefined' || $scope.primarySearchField =='') {
          fetch.url = $scope.resourceUrl +'?&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
        } else {
          fetch.url = $scope.resourceUrl +'?&'+ $scope.primarySearchField +'__contains=' + searchStr + '&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
        }
        if (typeof $scope.getParams != 'undefined') {
          for (var i = 0; i < $scope.getParams.length; i++) {
            fetch.url += '&'+$scope.getParams[i].key + '='+ $scope.getParams[i].value;
          }
        }
        $http({method: fetch.method, url: fetch.url}).
          then(function(response) {
            // console.log(response);
            $scope.pageCount = Math.floor(response.data.count/$scope.itemsPerView)+1;
            if ($scope.pageCount<$scope.pageList[0]) {
              $scope.pageList = [1];
            } else {
              $scope.pageList = [$scope.pageList[0]];
            }
            for (var i = $scope.pageList[0]+1; i <= $scope.pageCount; i++) {
              if ($scope.pageList.length<$scope.numOfPagesPerView) {
                $scope.pageList.push(i);
              }
            }
            // console.log($scope.pageList);
            $scope.tableData = response.data.results;
            $scope.originalTable = angular.copy($scope.tableData);
            $scope.sortFlag = [];
            $scope.tableHeading = [];
            for (key in $scope.tableData[0]){
              $scope.tableHeading.push(key);
              $scope.sortFlag.push(0);  // by default no sort is applied , 1 for accending and -1 for descending
            }
            if ($scope.isSelectable) {
              $scope.tableHeading.unshift('Select');
              $scope.sortFlag.unshift(-2); // no sort can be applied on this column
            }

            if ($scope.haveOptions) {
              $scope.tableHeading.push('Options')
              $scope.sortFlag.push(-2); // no sort possible
            }
          }, function(response) {

        });
      }

      $scope.$watch('getStr' , function(newValue , oldValue){
        $scope.fetchData(newValue);
      });

      $scope.$watch('searchText', function(newValue , oldValue){
        parts = newValue.split('>');
        if (typeof $scope.primarySearchField == 'undefined' || $scope.primarySearchField == '') {
          searchStr = newValue;
        } else {
          $scope.getStr = parts[0].trim();
          if (typeof parts[1] == 'undefined'){
            searchStr = '';
          }else{
            searchStr = parts[1].trim();
          };
        }
        // console.log(searchStr);
        $scope.fullTextSearch(searchStr);
      });

      $scope.changePage = function(toPage){
        // change page number ot the seleted page
        $scope.pageNo = toPage;
        $scope.fetchData();
        // console.log("will change the page now" + toPage);

      }

      $scope.loadPrevSetPages = function(){
        // function to load prev set of pages
        var currentlyFirst = $scope.pageList[0];
        if (currentlyFirst!=1) {
          $scope.pageList = [currentlyFirst - $scope.numOfPagesPerView];
          // console.log(pageCount);
          for (var i = $scope.pageList[0]+1; i <= $scope.pageCount; i++) {
            if ($scope.pageList.length<$scope.numOfPagesPerView) {
              $scope.pageList.push(i);
            }
          }
        }
      }
      $scope.loadNextSetPages = function(){
        // function to load the next set of pages
        // console.log($scope.pageList[$scope.pageList.length -1]);
        var currentlyLast = $scope.pageList[$scope.pageList.length -1];
        if (currentlyLast!=$scope.pageCount) {
          $scope.pageList = [currentlyLast+1];
          // console.log(pageCount);
          for (var i = $scope.pageList[0]+1; i <= $scope.pageCount; i++) {
            if ($scope.pageList.length<$scope.numOfPagesPerView) {
              $scope.pageList.push(i);
            }
          }
        }
      }
      $scope.changeNumView = function(num){
        $scope.itemsPerView = num;
        $scope.changePage(1);
        $scope.fetchData();
        // console.log($scope.pageNo);
      }
      $scope.sort = function(col){
        $scope.tableSnap = angular.copy($scope.tableData);
        if ($scope.sortFlag[col]==-2) {
          console.log("No sort possible");
          return;
        }

        // console.log("will sort according to col " + col);
        colData = [];
        len =$scope.tableData.length;
        var indices = new Array(len);
        for (var i = 0; i < len; i++) {
          colData.push($scope.tableData[i][$scope.tableHeading[col]]);
          indices[i] = i;
        }
        if ($scope.sortFlag[col]==0 || $scope.sortFlag[col]==-1) {
          indices.sort(function (a, b) { return colData[a] < colData[b] ? -1 : colData[a] > colData[b] ? 1 : 0; });
          $scope.sortFlag[col] = 1;

        }else{
          indices.sort(function (a, b) { return colData[a] > colData[b] ? -1 : colData[a] < colData[b] ? 1 : 0; });
          $scope.sortFlag[col] = -1;
        }

        for (var i = 0; i < $scope.sortFlag.length; i++) {
          if (i !=col && $scope.sortFlag[i] !==-2) {
            $scope.sortFlag[i] = 0;
          }
        }
        // console.log(indices)
        // console.log($scope.sortFlag);
        for(var i =0 ; i < len ; i++){
          $scope.tableData[i] = angular.copy($scope.tableSnap[indices[i]])
        }
      };
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {

    }
  };
});

app.directive('tableRow', function () {
  return {
    templateUrl:  '/static/ngTemplates/genericTable/tableRow.html',
    restrict: 'A',
    transclude: true,
    replace: true,
    scope:{
      data : '=',
      rowAction : '=',
      options : '=',
      checkbox : '=',
      selectable : '=',
    },
    controller : function($scope){

      if (typeof $scope.options == 'undefined') {
        $scope.optionsShow = false;
      }else{
        $scope.optionsShow = true;
      }
      if (typeof $scope.options.others == 'undefined') {
        $scope.otherOptions = false;
      }else{
        $scope.otherOptions = true;
      }
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {

    }
  };
});
// alert("Came in the ngSeachEmp js file");


app.directive('messageStrip', function () {
  return {
    template: '<li class="container-fluid navBarInfoList" ng-click="openChat(friend)">'+
      '<a class="row" style="position: relative; top:-7px; text-decoration:none !important;">'+
        '<img class="img-circle" ng-src="{{friend | getDP}}"  alt="My image" style="width:50px;height:50px;position: relative; top:-8px; "/>'+
        '<div class="col-md-10 pull-right" style="position: relative; top:-10px">'+
          '<span class="text-muted">{{friend | getName}}</span> {{data.count | decorateCount}}<small style="position:absolute;right:0px;" class="pull-right text-muted">{{data.created | timeAgo}} <i class="fa fa-clock-o "></i></small>'+
          '<br>{{data.message | limitTo:35}}'+
        '</div>'+
      '</a>'+
    '</li>',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
      openChat :'=',
    },
    controller : function($scope , userProfileService){
      $scope.me = userProfileService.get('mySelf');
      if ($scope.me.url.split('?')[0]==$scope.data.originator) {
        $scope.friend = $scope.data.user;
      }else{
        $scope.friend = $scope.data.originator;
      }
    }
  };
});

app.directive('notificationStrip', function () {
  return {
    template: '<li class="container-fluid navBarInfoList" >'+
      '<a href="{{data.url}}" class="row" style="position: relative; top:-7px; text-decoration:none !important;">'+
        '<i class="fa {{data.originator | getIcon:this}} fa-2x"></i>'+
        '<div class="col-md-11 pull-right" style="position: relative; top:-10px">'+
          '<span class="text-muted">{{data.originator}}</span><small style="position:absolute;right:0px;" class="pull-right text-muted">{{data.created | timeAgo}} <i class="fa fa-clock-o "></i></small>'+
          '<br>{{data.shortInfo | limitTo:45 }}'+
        '</div>'+
      '</a>'+
    '</li>',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
    },
    controller : function($scope){
      // console.log($scope.data);
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {

    }
  };
});


app.directive('chatWindow', function (userProfileService) {
  return {
    template: '<div class="chatWindow" style="height:{{toggle?500:36}}px;right:{{location}}px;">'+
      '<div class="header">'+
        '<div class="container-fluid">'+
          '<i class="fa fa-circle onlineStatus"></i>'+
          '<span class="username">{{friend.url | getName}}</span>'+
          '<span class="pull-right"><i class="fa fa-chevron-down" ng-click="toggle=!toggle"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-close" ng-click= "cancel()"></i></span>'+
        '</div>'+
      '</div>'+
      '<div class="messageView container-fluid" ng-show="toggle" id="scrollArea{{pos}}">'+
        '<div ng-repeat="message in ims">'+
          '<div class="row" ng-if="!senderIsMe[$index]">'+
            '<div class="col-md-3">'+
              '<img class="img-responsive img-circle" ng-src="{{message.originator | getDP}}" width="40px" height="50px" alt="P" style="position:relative; top:10px;margin-left:5px;">'+
            '</div>'+
            '<div class="col-md-8 messageBubble"> <p style="word-wrap: break-word;">{{message.message}}</p>'+
            '</div>'+
          '</div>'+
          // for the bubble with sender picture is on the left
          '<div class="row" ng-if="senderIsMe[$index]">'+
            '<div class="col-md-8 col-md-offset-1 messageBubble"> <p style="word-wrap: break-word;"> {{message.message}}</p>'+
            '</div>'+
            '<div class="col-md-3">'+
              '<img class="img-responsive img-circle" ng-src="{{message.originator | getDP}}" width="40px" height="50px" alt="P" style="position:relative; top:10px;margin-left:5px;">'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="row" style="height:40px;">'+
          '<span ng-show="isTyping" style = "padding:10px; id="typingStatus">Typing..</span>'+
        '</div>'+
      '</div>'+
      '<div class="footer" ng-show="toggle">'+
        '<div class="container-fluid">'+
          '<input type="text" class="form-control" name="name" value="" style="width:100%"  ng-enter="send()" ng-model="messageToSend"></input>'+
        '</div>'+
      '</div>'+
    '</div>',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      friendUrl : '=',
      pos : '=',
      cancel :'&',
    },
    controller : function($scope ,$location,  $anchorScroll, $http, $templateCache, $timeout){
      // console.log($scope.pos);
      $scope.me = userProfileService.get("mySelf");
      $scope.friend = userProfileService.get($scope.friendUrl);
      // console.log($scope.friend);
      $scope.isTyping = false;
      $scope.toggle = true;
      $scope.messageToSend = "";
      $scope.status = "N"; // neutral / No action being performed
      $scope.send = function(){
        console.log("going to publish" + $scope.messageToSend);
        msg = angular.copy($scope.messageToSend)
        if (msg!="") {

          $scope.status = "M"; // contains message
          $scope.ims.push({message: msg , originator: $scope.me.url})
          $scope.senderIsMe.push(true);
          connection.session.publish('service.chat.'+$scope.friend.username, [$scope.status , msg , $scope.me.username], {}, {acknowledge: true}).then(
            function (publication) {
              dataToSend = {message:msg , user: $scope.friendUrl , read:false};
              $http({method: 'POST', data:dataToSend, url: '/api/PIM/chatMessage/'})
            },
            function (error) {
              dataToSend = {message:msg , user: $scope.friendUrl , read:false};
              $http({method: 'POST', data:dataToSend, url: '/api/PIM/chatMessage/'})
            }
          );
          $scope.messageToSend = "";
        }
      }; // send function
      $scope.fetchMessages = function() {
        $scope.method = 'GET';
        $scope.url = '/api/PIM/chatMessageBetween/?other='+$scope.friend.username;
        $scope.ims = [];
        $scope.imsCount = 0;
        $scope.senderIsMe = [];
        $http({method: $scope.method, url: $scope.url}).
          then(function(response) {
            $scope.messageFetchStatus = response.status;
            $scope.imsCount = response.data.length;
            for (var i = 0; i < response.data.length; i++) {
              var im = response.data[i];
              sender = userProfileService.get(im.originator)
              if (sender.username == $scope.me.username) {
                $scope.senderIsMe.push(true);
              }else {
                $scope.senderIsMe.push(false);
              }
              $scope.ims.push(im);
              // console.log($scope.ims.length);
            }
          }, function(response) {
            $scope.messageFetchStatus = response.status;
        });
      };
      $scope.fetchMessages();
      $scope.scroll = function(){
        var $id= $("#scrollArea"+$scope.pos);
        $id.scrollTop($id[0].scrollHeight);
      }
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {
      scope.$watch('messageToSend', function(newValue , oldValue ){
        // console.log("changing");
        scope.status = "T"; // the sender is typing a message
        if (newValue!="") {
          connection.session.publish('service.chat.'+ scope.friend.username, [scope.status , scope.messageToSend , scope.me.username]);
        }
        scope.status = "N";
      }); // watch for the messageTosend
      scope.$watch('ims.length', function( ){
        setTimeout( function(){
          scope.scroll();
        }, 500 );
      });
      scope.$watch('pos', function( newValue , oldValue){
        // console.log(newValue);
        scope.location = 30+newValue*320;
        // console.log("setting the new position value");
        // console.log();
      });
    } // link
  };
});
