app.config(function($stateProvider){

  $stateProvider
  .state('admin', {
    url: "/admin",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/admin.html',
          controller: 'admin'
       },
       "menu@admin": {
          templateUrl: '/static/ngTemplates/adminMenu.html',
        }
    }
  })

  .state('admin.search', {
    url: "/search",
    templateUrl: '/static/ngTemplates/admin.search.html',
    controller: 'admin.search'
  })

  .state('admin.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/admin.manageUsers.html',
    controller: 'admin.manageUsers'
  })

});

app.controller('admin' , function($scope , userProfileService){


});

app.controller('admin.manageUsers' , function($scope , $http , $aside){
  emptyFile = new File([""], "");
  $scope.profileEditorUser = '/api/HR/userProfileAdminMode/1';
  $scope.editProfile = function(){
    console.log("Going to submit the profile data");
    console.log($scope.profile);
    var fd = new FormData();
    for(key in $scope.profile){
      if (key!='url' ) {
        console.log('For the key '  + key + ' the value is ' + $scope.profile[key]);
        if ($scope.profileFormStructure[key].type.indexOf('integer')!=-1 ) {
          if ($scope.profile[key]!= null) {
            fd.append( key , parseInt($scope.profile[key]));
          }
        }else if ($scope.profileFormStructure[key].type.indexOf('date')!=-1 ) {
          if ($scope.profile[key]!= null) {
            fd.append( key , $scope.profile[key]);
          }
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

  $http({method :'OPTIONS' , url : '/api/HR/userProfileAdminMode'}).
  then(function(response){
    $scope.formData = response.data.actions.POST;
    console.log(response.data.actions.POST);
  } , function(response){
    console.log(response);
  });

  $http({method :'GET' , url : $scope.profileEditorUser}).
  then(function(response){
    $scope.profile = response.data;
    console.log($scope.profile);
    $http({method :'OPTIONS' , url : '/api/HR/userProfileAdminMode'}).
    then(function(response){
      $scope.profileFormStructure = response.data.actions.POST;
      for(key in $scope.profileFormStructure){
        if ($scope.profileFormStructure[key].type.indexOf('upload') !=-1) {
          $scope.profile[key] = emptyFile;
        }
      }
      console.log($scope.profile);
      $scope.profileUrl = $scope.profile.url.replace('userProfile' , 'userProfileAdminMode')
    } , function(response){
      console.log(response);
    });
  } , function(response){
    console.log(response);
  });

  $scope.statusMessage = '';
  $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
  $scope.createUser = function(){
    console.log("going to create a new User");
    dataToSend = {username : $scope.newUser.username , first_name : $scope.newUser.firstName , last_name : $scope.newUser.lastName , password : $scope.newUser.password};
    $http({method : 'POST' , url : '/api/HR/users/', data : dataToSend }).
    then(function(response){
      $scope.httpStatus = 'success';
      $scope.statusMessage = response.status + ' : ' + response.statusText;
      $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.httpStatus = '';
        $scope.$apply();
      }, 2000);
    } , function(response){
      $scope.statusMessage = response.status + ' : ' + response.statusText;
      $scope.httpStatus = 'danger';
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.httpStatus = '';
        $scope.$apply();
      }, 2000);
    });
  }

  $scope.openAside = function(position, backdrop) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $aside.open({
      templateUrl: '/static/ngTemplates/admin.manageUsers.html',
      placement: position,
      size: 'lg',
      backdrop: backdrop,
      controller: function($scope, $modalInstance) {
        $scope.ok = function(e) {
          $modalInstance.close();
          e.stopPropagation();
        };
        $scope.cancel = function(e) {
          $modalInstance.dismiss();
          e.stopPropagation();
        };
      }
    }).result.then(postClose, postClose);
  }


});
app.controller('admin.search' , function($scope ){
  $scope.views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
      {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
      {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
      {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
    ];

  $scope.options = {main : {icon : 'fa-envelope-o', text: 'im'} ,
    others : [{icon : '' , text : 'social' },
      {icon : '' , text : 'learning' },
      {icon : '' , text : 'leaveManagement' },
      {icon : '' , text : 'editProfile' },
      {icon : '' , text : 'editDesignation' }]
    };

  $scope.multiselectOptions = [{icon : 'fa fa-book' , text : 'Learning' },
    {icon : 'fa fa-bar-chart-o' , text : 'Performance' },
    {icon : 'fa fa-envelope-o' , text : 'message' }
  ];

  $scope.tableAction = function(urls , action , mode){
    console.log(mode);
    console.log(action);
    console.log(urls);
    if (typeof mode == 'undefined') {
      if (action == 'im') {
        var scope = angular.element(document.getElementById('instantMessangerCtrl')).scope();
        scope.$apply(function() {
          scope.addIMWindow(urls);
        });
      }
      // for the single select actions
    } else {
      if (mode == 'multi') {

      }
    }
  }


});
