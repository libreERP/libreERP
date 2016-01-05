app.controller('admin.settings.configure' , function($scope , $stateParams , $http , $aside , $state , Flash , userProfileService , $filter){
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

app.controller('admin.settings.modulesAndApps' , function($scope , $http , $aside , $state , Flash , userProfileService , $filter){

  $scope.resourceUrl = '/api/ERP/applicationAdminMode/';

  $scope.views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/app.ERP.settings.modulesAndApps.list.html' ,
    itemTemplate : '/static/ngTemplates/app.ERP.settings.modulesAndApps.item.html',

  },];

  $scope.editorTemplate ='/static/ngTemplates/app.ERP.settings.modulesAndApps.form.html',

  $scope.rowInput = {
    ownersSearch : function(query) {
      return $http.get('/api/HR/userSearch/?username__contains=' + query)
    },
    appSearch : function(query) {
      return $http.get('/api/ERP/applicationAdminMode/?name__contains=' + query).
      then(function(response){
        return response.data;
      })
    },
    moduleSearch : function(query) {
      return $http.get('/api/ERP/module/?name__contains=' + query).
      then(function(response){
        return response.data;
      })
    },
    views : [{name : 'list' , icon : 'fa-bars' ,
      template : '/static/ngTemplates/app.ERP.settings.modulesAndApps.settingsFields.html' ,
    },],
    rowInput : { rowTemplate : '/static/ngTemplates/app.ERP.settings.modulesAndApps.settingsFields.row.html' , }
  }

  $scope.tableAction = function(target , type , data ){

    if (target !='new') {
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
    } else {
      dataToSend = {
        description : data.description,
        icon : data.icon,
      },
      url = '/api/ERP/module/' ;

      if (type != 'module') {
        dataToSend.module = data.module.pk;
        url = '/api/ERP/applicationAdminMode/'

        if (type == 'app') {
          dataToSend.name = type + '.' + data.module.name +'.' + data.name;
        } else {
          dataToSend.canConfigure = data.app.pk;
          parts = data.app.name.split('.');
          dataToSend.name = type + '.' + data.module.name + '.' + data.name + '.' + parts[parts.length-1];
        }
      } else {
        dataToSend.name = data.name;
      }
      $http({method : 'POST' , url : url , data : dataToSend}).
      then(function(response){
        $scope.$broadcast('forceSetFormData', { icon : '' , name : '' , description : '' , module : '' , type : 'module' , app : '' });
        if (response.config.url.indexOf('/ERP/module/') == -1) {
          $scope.$broadcast('forceInsetTableData', response.data);
        }
        Flash.create('success', response.status + ' : ' + response.statusText );
      }, function(response){
        Flash.create('danger', response.status + ' : ' + response.statusText );
      })
    }
  }


});

app.controller('admin.settings' , function($scope , $http , $aside , $state , Flash , userProfileService , $filter){
  // settings main page controller

  $scope.getState = function(index){
    parts = $scope.applications[index].name.split('.');
    if (parts[0] == 'configure') {
      return  'admin.settings.configure ({canConfigure :' + $scope.applications[index].canConfigure + ', app :"' + parts[3] + '"})'; ;
    } else {
      return $scope.applications[index].name.replace('sudo.' , '')
    }
  }

  $http({method : 'GET' , url : '/api/ERP/application/?name__contains=admin.settings'}).
  then(function(response){
    $scope.applications = response.data;
  }, function(response){

  })

});
