
app.controller('admin.manageUsers.mailAccount' , function($scope , $http){
  $scope.generateMailPasskey = function() {
    console.log($scope);
    console.log($scope.data);
    $http({method : 'PATCH' , url : '/api/mail/account/' + $scope.data.mailAccount.pk + '/?user=' +  $scope.data.mailAccount.user}).
    then(function(response) {
      $scope.data.mailAccount = response.data;
    });
  }
});


app.controller('admin.manageUsers' , function($scope , $http , $aside , $state , Flash , $users , $filter){

  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
      {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
      {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
      {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
    ];

  var options = {main : {icon : 'fa-envelope-o', text: 'im'} ,
    others : [{icon : '' , text : 'social' },
      {icon : '' , text : 'editProfile' },
      {icon : '' , text : 'editDesignation' },
      {icon : '' , text : 'editPermissions' },
      {icon : '' , text : 'editMaster' },]
    };
  var fields = ['username' , 'email' , 'first_name' , 'last_name' , 'profile'];

  var multiselectOptions = [{icon : 'fa fa-book' , text : 'Learning' },
    {icon : 'fa fa-bar-chart-o' , text : 'Performance' },
    {icon : 'fa fa-envelope-o' , text : 'message' },
  ];

  $scope.config = {
    url : '/api/HR/users/' ,
    views : views ,
    options : options,
    multiselectOptions : multiselectOptions,
    searchField : 'username',
    fields : fields,
  };

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.data = {tableData : []};

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {

      if ($scope.tabs[i].app == input.app) {
        if ((typeof $scope.tabs[i].data.url != 'undefined' && $scope.tabs[i].data.url == input.data.url )|| (typeof $scope.tabs[i].data.pk != 'undefined' && $scope.tabs[i].data.pk == input.data.pk)) {
          $scope.tabs[i].active = true;
          alreadyOpen = true;
        }
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }




  // create new user
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


  $scope.tableAction = function(target , action , mode){
    // target is the url of the object
    if (typeof mode == 'undefined') {
      if (action == 'im') {
        $scope.$parent.$parent.addIMWindow(target);
      } else if (action == 'editProfile') {

        $http({method :'options' , url : '/api/HR/profileAdminMode'}).
        then(function(response){
          $scope.profileFormStructure = response.data.actions.POST;
          console.log(target);
          console.log($scope.data);
          for (var i = 0; i < $scope.data.tableData.length; i++) {
            if ($scope.data.tableData[i].pk == target){
              url = '/api/HR/profileAdminMode/' + $scope.data.tableData[i].profile.pk + '/';
            }
          }
          $http({method :'GET' , url : url}).
          then((function(target) {
            return function(response){
              $scope.profile = response.data;
              for(key in $scope.profileFormStructure){
                if ($scope.profileFormStructure[key].type.indexOf('upload') !=-1) {
                  $scope.profile[key] = emptyFile;
                }
              }
              console.log(target);
              u = $users.get(target)
              $scope.addTab({title : 'Edit profile of ' + u.first_name + ' ' + u.last_name  , cancel : true , app : 'editProfile' , data : $scope.profile , active : true})
            }
          })(target));
        });

      } else if (action == 'social') {
        $state.go('home.social' , {id : target})
      } else if (action == 'editMaster') {
        console.log(target);
        $http({method : 'GET' , url : '/api/HR/usersAdminMode/' + target + '/'}).
        then(function(response){
          $http({method : 'GET' , url : '/api/mail/account/?user=' + target }).
          then((function(userData){
            return function(response) {
              userData.mailAccount = response.data[0];
              $scope.addTab({title : 'Edit master data  for ' + userData.first_name + ' ' + userData.last_name , cancel : true , app : 'editMaster' , data : userData , active : true})
            }
          })(response.data))
        })
      } else if (action == 'editPermissions') {
        u = $users.get(target)
        $http.get('/api/ERP/application/?user='+ u.username ).
        success((function(target){
          return function(data){
            u = $users.get(target)
            permissionsFormData = {
              appsToAdd : data,
              url : target,
            }
            $scope.addTab({title : 'Edit permissions for ' + u.first_name + ' ' + u.last_name  , cancel : true , app : 'editPermissions' , data : permissionsFormData , active : true})
          }
        })(target));
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
    var userData = $scope.tabs[index].data;
    if (userData.appsToAdd.length == 0) {
      Flash.create('warning' , 'No new permission to add')
      return;
    }
    var apps = [];
    for (var i = 0; i < userData.appsToAdd.length; i++) {
      apps.push(userData.appsToAdd[i].pk)
    }
    var dataToSend = {
      user : getPK(userData.url),
      apps : apps,
    }
    $http({method : 'POST' , url : '/api/ERP/permission/' , data : dataToSend}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })

  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/application/?name__contains=' + query)
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
    $http({method : 'PATCH' , url :'/api/HR/profileAdminMode/' + userData.pk +'/', data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
       Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
       Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };

  $scope.updateUserMasterDetails = function(index){
    var userData = $scope.tabs[index].data;
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

});
