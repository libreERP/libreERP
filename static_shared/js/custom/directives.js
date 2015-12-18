app.directive('genericCalendar' , function(){
  return {
    templateUrl: '/static/ngTemplates/calendar.html',
    restrict: 'E',
    replace: true,
    scope: {
      dateDisp : '=date',
      dayItems : '=',
      itemTemplates :'@',
    },

    controller : function($scope){
      // Everything related to the calendar from is from this point
      // console.log($scope.dayItems);
      // console.log($scope.itemTemplates);


      $scope.listOfMonths = [{"val":0, "disp":"January"}, {"val":1, "disp":"February"}, {"val":2, "disp":"March"}, {"val":3, "disp":"April"}, {"val":4, "disp":"May"},
        {"val":5, "disp":"June"}, {"val":6, "disp":"July"}, {"val":7, "disp":"August"}, {"val":8, "disp":"September"}, {"val":9, "disp":"October"}, {"val":10, "disp":"November"},
        {"val":11, "disp":"December"}];
      $scope.listOfYears = [{"val":2015, "disp":"2015"}, {"val":2016, "disp":"2016"}, {"val":2017, "disp":"2017"}, {"val":2018, "disp":"2018"}, {"val":2019, "disp":"2019"}];
      $scope.listOfDays = [{"val":1, "disp":"Sunday"}, {"val":1, "disp":"Monday"}, {"val":1, "disp":"Tuesday"}, {"val":1, "disp":"Wednesday"}, {"val":1, "disp":"Thursday"},
        {"val":1, "disp":"Friday"}, {"val":1, "disp":"Saturday"}];

      var calDate = new Date(); // the current date value known to the calendar, also the selected. For a random month its 1st day of that month.
      var calMonth = calDate.getMonth(); // in MM format
      var calYear = calDate.getFullYear(); // in YYYY format

      datesMap = getDays(calMonth, calYear);
      $scope.dates = datesMap.days;
      $scope.dateFlags = datesMap.flags;
      $scope.dateDisp = calDate;
      $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp; // Find equivalent day name from the index

      $scope.dropYear ={"val":calYear, "disp":""}; // year selected in the drop down menu
      $scope.dropMonth = {"val":calMonth, "disp":""}; // Month selected in the drop down menu

      $scope.showDetails = function(val){
        if (datesMap.flags[val]=="Cur"){
          $scope.calDate = calDate.setFullYear(calYear, calMonth, $scope.dates[val]);
          $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
          $scope.dateDisp = calDate;
        }else if(datesMap.flags[val]=="Prev"){
          var selectedDate = $scope.dates[val];
          $scope.gotoPrev();
          $scope.calDate = calDate.setFullYear(calYear, calMonth, selectedDate);
          $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
          $scope.dateDisp = calDate;
        }else if(datesMap.flags[val]=="Next"){
          var selectedDate = $scope.dates[val];
          $scope.gotoNext();
          $scope.calDate = calDate.setFullYear(calYear, calMonth, selectedDate);
          $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
          $scope.dateDisp = calDate;
        };
      };

      $scope.itemsGroup = [];
      for (var i = 0; i < 42; i++) {
        $scope.itemsGroup.push([])
      }

      $scope.$watchCollection('dates' , function(newValue , oldValue){
        for (var i = 0; i < 42; i++) {
          for (var j = 0; j < $scope.dayItems.length; j++) {
            d = $scope.dayItems[j].date;
            if ($scope.dateFlags[i] == 'Cur') {
              if ($scope.dateDisp.getFullYear() == d.getFullYear() && $scope.dateDisp.getMonth() == d.getMonth() && $scope.dates[i] == d.getDate()) {
                $scope.itemsGroup[i].push(j)
              }
            } else if ($scope.dateFlags[i] == 'Next') {
              if ($scope.dateDisp.getFullYear() == d.getFullYear() && $scope.dateDisp.getMonth() +1 == d.getMonth() && $scope.dates[i] == d.getDate()) {
                $scope.itemsGroup[i].push(j)
              }
            } else if ($scope.dateFlags[i] == 'Prev') {
              if ($scope.dateDisp.getFullYear() == d.getFullYear() && $scope.dateDisp.getMonth()-1 == d.getMonth() && $scope.dates[i] == d.getDate()) {
                $scope.itemsGroup[i].push(j)
              }
            }
          }
        }
      });


      $scope.gotoToday = function(){
        var calDate = new Date(); // current day
        calMonth = calDate.getMonth();
        calYear = calDate.getFullYear();
        $scope.dateDisp = calDate;
        $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
        datesMap = getDays(calMonth, calYear);
        $scope.dates = datesMap.days;
        $scope.dateFlags = datesMap.flags;
      };
      $scope.gotoNext = function(){
        calMonth +=1;
        calDate.setFullYear(calYear, calMonth, 1);
        datesMap = getDays(calMonth, calYear);
        $scope.dates = datesMap.days;
        $scope.dateFlags = datesMap.flags;
        $scope.dateDisp = calDate;
        $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
      };
      $scope.gotoPrev = function(){
        calMonth -=1;
        calDate.setFullYear(calYear, calMonth, 1);
        datesMap = getDays(calMonth, calYear);
        $scope.dates = datesMap.days;
        $scope.dateFlags = datesMap.flags;
        $scope.dateDisp = calDate;
        $scope.dayDisp = $scope.listOfDays[calDate.getDay()].disp;
      };
      $scope.gotoPerticular = function(){
        calMonth = $scope.dropMonth.val;
        calYear = $scope.dropYear.val;
        calDate.setFullYear(calYear, calMonth, 1);
        $scope.dateDisp = calDate;
        datesMap = getDays(calMonth, calYear);
        $scope.dates = datesMap.days;
        $scope.dateFlags = datesMap.flags;
      };
      $scope.range = function(min, max, step){
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
      };

    },
  };
});

app.directive('focusMe', function($timeout) {
  // bring any input into focus based on the focus-me = "true" attribute
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value) {
        if(value === true) {
          element[0].focus();
          scope[attrs.focusMe] = false;
        }
      });
    }
  };
});

app.directive('breadcrumb', function () {
  return {
    templateUrl: '/breadcrumb.html',
    restrict: 'E',
    replace: true,
    scope: false,
    controller : function($scope , $state , $stateParams){
      var stateName = $state.current.name;
      $scope.stateParts = stateName.split('.');
      for(key in $stateParams){
        if (typeof $stateParams[key] != 'undefined' && $stateParams[key] != '') {
          $scope.stateParts.push($stateParams[key]);
        };
      };
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
    templateUrl: '/static/ngTemplates/messageStrip.html',
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
    templateUrl: '/static/ngTemplates/notificationStrip.html',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
    },
    controller : function($scope , $http , userProfileService , $aside ){
      parts = $scope.data.shortInfo.split(':');
      // console.log(parts);
      if(typeof parts[1] == 'undefined'){
        $scope.notificationType = 'default';
      } else {
        $scope.notificationType = parts[0];
      }
      // console.log($scope.data);
      // console.log($scope.notificationType);
      nodeUrl = '/api/social/' + $scope.notificationType + '/'
      if(typeof parts[1] != 'undefined' && $scope.data.originator == 'social'){
        // console.log(nodeUrl + parts[1]);
        $http({method : 'GET' , url : nodeUrl + parts[1] + '/'}).
        then(function(response){
          $scope.friend = response.data.user;
          $http({method: 'GET' , url : response.data.parent}).then(function(response){
            $scope.notificationData = response.data;
            // console.log($scope.notificationData);
            if ($scope.notificationType == 'pictureComment') {
              $http({method : 'GET' , url : '/api/social/album/' +  $scope.data.shortInfo.split(':')[3] + '/?user=' + userProfileService.get($scope.notificationData.user).username}).
              then(function(response){
                $scope.objParent = response.data;
              });
            };
          });
        });
      };

      $scope.openAlbum = function(position, backdrop , input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.album.html',
          placement: position,
          size: 'lg',
          backdrop: backdrop,
          controller: 'controller.social.aside.picture',
          resolve: {
           input: function () {
             return input;
            }
          }
        }).result.then(postClose, postClose);
      }

      $scope.openPost = function(position, backdrop , input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller:'controller.social.aside.post',
          resolve: {
           input: function () {
             return input;
            }
          }
        }).result.then(postClose, postClose);
      }
      $scope.openNotification = function(){
        $http({method: 'PATCH' , url : $scope.data.url , data : {read : true}}).
        then(function(response){
          $scope.$parent.notificationClicked($scope.data.url);
          $scope.data.read = true;
        });
        if ($scope.notificationType == 'postLike' || $scope.notificationType == 'postComment') {
          $scope.openPost('right', true , {data: $scope.notificationData , onDelete: function(){return;}})
        } else if ($scope.notificationType == 'pictureLike' || $scope.notificationType == 'pictureComment') {

          console.log($scope.objParent);
          $scope.openAlbum('right', true , {data: $scope.notificationData , parent : $scope.objParent , onDelete: ""})
        }
      }
    },
  };
});


app.directive('chatWindow', function (userProfileService) {
  return {
    templateUrl: '/static/ngTemplates/chatWindow.html',
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
          dataToSend = {message:msg , user: $scope.friendUrl , read:false};
          $http({method: 'POST', data:dataToSend, url: '/api/PIM/chatMessage/'}).
          then(function(response){
            $scope.ims.push(response.data)
            $scope.senderIsMe.push(true);
            connection.session.publish('service.chat.'+$scope.friend.username, [$scope.status , response.data.message , $scope.me.username , response.data.url], {}, {acknowledge: true}).
            then(function (publication) {});
            $scope.messageToSend = "";
          })
        }
      }; // send function

      $scope.addMessage = function(msg , url){
        $scope.ims.push({message: msg , originator:$scope.friendUrl})
        $http({method : 'PATCH' , url : url + '?mode=' , data : {read : true}})
      }

      $scope.fetchMessages = function() {
        $scope.method = 'GET';
        $scope.url = '/api/PIM/chatMessageBetween/?other='+$scope.friend.username;
        $scope.ims = [];
        $scope.imsCount = 0;
        $scope.senderIsMe = [];
        $http({method: $scope.method, url: $scope.url}).
        then(function(response) {
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
