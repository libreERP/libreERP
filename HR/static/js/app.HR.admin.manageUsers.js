
app.controller('admin.manageUsers' , function($scope , $http , $aside , $state , Flash , userProfileService , $filter){

  $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
  $scope.createUser = function(){
    dataToSend = {username : $scope.newUser.username , first_name : $scope.newUser.firstName , last_name : $scope.newUser.lastName , password : $scope.newUser.password};
    $http({method : 'POST' , url : '/api/HR/usersAdminMode/', data : dataToSend }).
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
      {icon : '' , text : 'editDesignation' },
      {icon : '' , text : 'editPermissions' },
      {icon : '' , text : 'editMaster' },]
    };

  $scope.multiselectOptions = [{icon : 'fa fa-book' , text : 'Learning' },
    {icon : 'fa fa-bar-chart-o' , text : 'Performance' },
    {icon : 'fa fa-envelope-o' , text : 'message' },
  ];

  $scope.tableAction = function(target , action , mode){
    // target is the url of the object
    if (typeof mode == 'undefined') {
      if (action == 'im') {
        $scope.$parent.$parent.addIMWindow(target);
      } else if (action == 'editProfile') {

        $http({method :'options' , url : '/api/HR/profileAdminMode'}).
        then(function(response){
          $scope.profileFormStructure = response.data.actions.POST;
          $http({method :'GET' , url : target.replace('users' , 'profileAdminMode')}).
          then(function(response){
            $scope.profile = response.data;
            for(key in $scope.profileFormStructure){
              if ($scope.profileFormStructure[key].type.indexOf('upload') !=-1) {
                $scope.profile[key] = emptyFile;
              }
            }
            u = userProfileService.get(response.config.url.replace('profileAdminMode' , 'users'))
            $scope.addTab({title : 'Edit profile of ' + u.first_name + ' ' + u.last_name  , cancel : true , app : 'editProfile' , data : $scope.profile , active : true})
          });
        });

      } else if (action == 'social') {
        $state.go('home.social' , {id : getPK(target)})
      } else if (action == 'editMaster') {
        $http({method : 'GET' , url : target.replace('users' , 'usersAdminMode')}).
        then(function(response){
          $scope.addTab({title : 'Edit master data  for ' + response.data.first_name + ' ' + response.data.last_name , cancel : true , app : 'editMaster' , data : response.data , active : true})
        })
      } else if (action == 'editPermissions') {
        u = userProfileService.get(target)
        permissionsFormData = {
          permissionsToAdd : [],
          url : target,
        }
        $scope.addTab({title : 'Edit permissions for ' + u.first_name + ' ' + u.last_name  , cancel : true , app : 'editPermissions' , data : permissionsFormData , active : true})
      }
      // for the single select actions
    } else {
      if (mode == 'multi') {
        console.log(target);
        console.log(action);
      }
    }
  }

  $scope.updateUserPermissions = function(index){
    userData = $scope.tabs[index].data;
    if (userData.appsToAdd.length == 0) {
      Flash.create('warning' , 'No new permission to add')
      return;
    }
    for (var i = 0; i < userData.appsToAdd.length; i++) {
      dataToSend = {
        user : getPK(userData.url),
        app : userData.appsToAdd[i].pk,
      }
      $http({method : 'POST' , url : '/api/HR/permission/' , data : dataToSend}).
      then(function(response){
        Flash.create('success', response.status + ' : ' + response.statusText);
     }, function(response){
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })
    }

  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/HR/application/?name__contains=' + query)
  }

  $scope.updateProfile = function(index){
    userData = $scope.tabs[index].data;
    var fd = new FormData();
    for(key in userData){
      if (key!='url' && userData[key] != null) {
        if ($scope.profileFormStructure[key].type.indexOf('integer')!=-1 ) {
          if (userData[key]!= null) {
            fd.append( key , parseInt(userData[key]));
          }
        }else if ($scope.profileFormStructure[key].type.indexOf('date')!=-1 ) {
          if (userData[key]!= null) {
            fd.append( key , $filter('date')(userData[key] , "yyyy-MM-dd"));
          }
        }else if ($scope.profileFormStructure[key].type.indexOf('url')!=-1 && (userData[key]==null || userData[key]=='')) {
          // fd.append( key , 'http://localhost');
        }else{
          fd.append( key , userData[key]);
        }
      }
    }
    $http({method : 'PATCH' , url : userData.url.replace('profile' , 'profileAdminMode'), data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
       Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
       Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };

  $scope.updateUserMasterDetails = function(index){
    userData = $scope.tabs[index].data;
    dataToSend = {
      username : userData.username,
      last_name : userData.last_name,
      first_name : userData.first_name,
      is_staff : userData.is_staff,
      is_active : userData.is_active,
    }
    if (userData.password != '') {
      dataToSend.password = userData.password
    }
    $http({method : 'PATCH' , url : userData.url.replace('users' , 'usersAdminMode') , data : dataToSend }).
    then(function(response){
       Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
       Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.addTab = function( input ){
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.url == input.data.url && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }


});
