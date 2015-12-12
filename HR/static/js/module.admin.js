app.config(function($stateProvider){

  $stateProvider
  .state('admin', {
    url: "/admin",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/admin.html',
       },
       "menu@admin": {
          templateUrl: '/static/ngTemplates/admin.menu.html',
        },
        "@admin": {
          templateUrl: '/static/ngTemplates/admin.dash.html',
          controller : 'admin'
        }
    }
  })

  .state('admin.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/admin.manage.users.html',
    controller: 'admin.manageUsers'
  })

});

app.controller('admin' , function($scope , userProfileService , Flash){
});

app.controller('admin.manageUsers' , function($scope , $http , $aside , $state , Flash){

  $scope.statusMessage = '';
  $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
  $scope.createUser = function(){
    console.log("going to create a new User");
    dataToSend = {username : $scope.newUser.username , first_name : $scope.newUser.firstName , last_name : $scope.newUser.lastName , password : $scope.newUser.password};
    $http({method : 'POST' , url : '/api/HR/users/', data : dataToSend }).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText );
      $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    });
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }


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
    {icon : 'fa fa-envelope-o' , text : 'message' },
    {icon : 'fa fa-file' , text : 'somethign'}
  ];

  $scope.tableAction = function(target , action , mode){
    if (typeof mode == 'undefined') {
      if (action == 'im') {
        $scope.$parent.$parent.addIMWindow(target);
      } else if (action == 'editProfile') {
        $scope.searchTabActive = false;
        alreadyOpen = false;
        for (var i = 0; i < $scope.tabs.length; i++) {
          if ($scope.tabs[i].objUrl == target) {
            $scope.tabs[i].active = true;
            alreadyOpen = true;
          }else{
            $scope.tabs[i].active = false;
          }
        }
        if (!alreadyOpen) {
          $scope.tabs.push({title : 'Edit Profile' , cancel : true , app : 'profileEditor' , objUrl : target , active : true})
        }
      } else if (action == 'social') {
        $state.go('home.social' , {id : target.split('users/')[1].split('/')[0]})
      }
      // for the single select actions
    } else {
      if (mode == 'multi') {
        console.log(target);
        console.log(action);
      }
    }
  }

});

app.directive('profileEditor', function () {
  return {
    templateUrl: '/profileEditor.html',
    restrict: 'E',
    replace: true,
    scope: {
      objUrl :'=',
    },
    controller : function($scope , $http , userProfileService , Flash){
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
           Flash.create('success', response.status + ' : ' + response.statusText);
        }, function(response){
           Flash.create('danger', response.status + ' : ' + response.statusText);
        });
      }
    },
  };
});
