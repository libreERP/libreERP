app.controller('admin.settings.configure.blog' , function($scope , $stateParams , $http , $aside , $state , Flash , $users , $filter){
  console.log('hey');

  $scope.editor = {title : '' , pk : null}

  $http({method : 'GET' , url : '/api/PIM/blogTags/'}).
  then(function(response) {
    $scope.tags = response.data;
  })

  $scope.edit = function(index) {
    $scope.tagBackup = angular.copy($scope.tags[index]);
    $scope.tags.splice(index , 1)
    $scope.editor.title = angular.copy($scope.tagBackup.title);
    $scope.editor.pk = angular.copy($scope.tagBackup.pk);
  }

  $scope.saveCategory = function() {
    var url = '/api/PIM/blogTags/'
    var method = 'POST';
    var dataToSend = {
      title : $scope.editor.title
    };
    if($scope.editor.pk != null){
      $scope.tagBackup.title = $scope.editor.title;
      url += $scope.editor.pk + '/';
      method = 'PATCH';
    }

    $http({method : method , url : url , data : dataToSend}).
    then(function(response) {
      $scope.tags.push(response.data);
      $scope.editor = {title : '' , pk : null};
    })

  }

  $scope.delete = function(index) {
    $http({method : 'DELETE' , url : '/api/PIM/blogTags/' + $scope.tags[index].pk +'/'}).
    then(function(response) {
      $scope.tags.splice(index , 1);
    })
  }

  $scope.cancelEditor = function() {
    $scope.tags.push($scope.tagBackup);
    $scope.editor = {title : '' , pk : null};
  }

});
app.controller('admin.settings.configure' , function($scope , $stateParams , $http , $aside , $state , Flash , $users , $filter){

  // settings for dashboard controller
  if (typeof $stateParams.canConfigure == 'undefined') {
    return;
  }

  $http({method:'GET' , url : '/api/ERP/appSettingsAdminMode/?app=' + $stateParams.canConfigure}).
  then(function(response){
    $scope.settings = response.data;
    for (var i = 0; i < $scope.settings.length; i++) {
      $scope.settings[i].data = $scope.settings[i][$scope.settings[i].fieldType];
    }
  })

  $scope.save = function(){
    for (var i = 0; i < $scope.settings.length; i++) {
      if ($scope.settings[i].fieldType == 'flag') {
        dataToSend = {
          flag : $scope.settings[i].flag
        }

      }else {
        dataToSend = {
          value : $scope.settings[i].value
        }
      }
      $http({method : 'PATCH' , url : '/api/ERP/appSettingsAdminMode/'+ $scope.settings[i].pk + '/' , data : dataToSend } ).
      then(function(response){
        Flash.create('success', response.status + ' : ' + response.statusText );
      }, function(response){
        Flash.create('danger', response.status + ' : ' + response.statusText );
      });
    }
  }


});


app.controller('admin.settings.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  var getState = function(input){
    parts = input.name.split('.');
    // console.log(parts);
    if (parts[0] == 'configure') {
      return  'admin.settings.configure ({canConfigure :' + input.canConfigure + ', app :"' + parts[2] + '"})'; ;
    } else {
      return input.name.replace('sudo' , 'admin')
    }
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 2 || parts.length != 3) {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };

  $scope.isActive = function(index){
    app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return  $state.is(app.name.replace('sudo' , 'admin'))
    }
  }

});
