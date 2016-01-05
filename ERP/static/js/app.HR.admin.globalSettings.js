app.controller('admin.globalSettings.configure' , function($scope , $stateParams , $http , $aside , $state , Flash , userProfileService , $filter){
  // globalSettings for dashboard controller
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
          flag : $scope.settings[i].data
        }

      }else {
        dataToSend = {
          value : $scope.settings[i].data
        }
      }
      $http({method : 'PATCH' , url : '/api/ERP/appSettingsAdminMode/'+ $scope.settings[i].pk + '/' , data : dataToSend } ).
      then(function(response){
        Flash.create('success', response.status + ' : ' + response.statusText );
      }, function(response){
        Flash.create('danger', response.status + ' : ' + response.statusText );
      })
    }
  }


});

app.controller('admin.globalSettings.modulesAndApps' , function($scope , $http , $aside , $state , Flash , userProfileService , $filter){

  $scope.resourceUrl = '/api/ERP/applicationAdminMode/';

  $scope.views = [{name : 'list' , icon : 'fa-bars' , template : '/static/ngTemplates/app.ERP.settings.modulesAndApps.list.html' , itemTemplate : '/static/ngTemplates/app.ERP.settings.modulesAndApps.item.html'},
    ];

  $scope.rowInput = {
    ownersSearch : function(query) {
      return $http.get('/api/HR/userSearch/?username__contains=' + query)
    },
    template : '/static/ngTemplates/app.ERP.settings.modulesAndApps.form.apps.html',
  }

  $scope.tableAction = function(target , action , data){
    if (action == 'submitForm') {
      owners = [];
      for (var i = 0; i < data.owners.length; i++) {
        owners.push(data.owners[i].pk)
      }
      dataToSend = {
        owners : owners,
      }
      $http({method : 'PATCH' , url : $scope.resourceUrl + data.pk + '/' , data : dataToSend}).
      then(function(response){
        $scope.$broadcast('forceGenericTableRowRefresh', { owners : response.data.owners , pk : response.data.pk});
        Flash.create('success', response.status + ' : ' + response.statusText );
      }, function(response){
        Flash.create('danger', response.status + ' : ' + response.statusText );
      })
    }
  }


});

app.controller('admin.globalSettings' , function($scope , $http , $aside , $state , Flash , userProfileService , $filter){
  // globalSettings main page controller

  $scope.getState = function(index){
    parts = $scope.applications[index].name.split('.');
    if (parts[0] == 'configure') {
      return  'admin.globalSettings.configure ({canConfigure :' + $scope.applications[index].canConfigure + ', app :"' + parts[3] + '"})'; ;
    } else {
      return $scope.applications[index].name.replace('state.' , '')
    }
  }

  $http({method : 'GET' , url : '/api/ERP/application/?name__contains=admin.globalSettings'}).
  then(function(response){
    $scope.applications = response.data;
  }, function(response){

  })

});
