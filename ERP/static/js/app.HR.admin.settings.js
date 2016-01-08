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

app.controller('admin.settings.modulesAndApps' , function($scope , $http , $aside , $state , Flash , $users , $filter){

  $scope.resourceUrl = '/api/ERP/applicationAdminMode/';

  $scope.views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/app.ERP.settings.modulesAndApps.list.html' ,
    itemTemplate : '/static/ngTemplates/app.ERP.settings.modulesAndApps.item.html',

  },];

  $scope.editorTemplate ='/static/ngTemplates/app.ERP.settings.modulesAndApps.form.html',

  $scope.rowInput = { // row input is available as rowScope in the main table scope and later fused with the rowScopes
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

// controller for the inline form in the modal window of the application edit form
app.controller('sudo.admin.settings.modulesAndApplications.appSettings' , function($scope , $http , $aside , $state , Flash , $users , $filter){
  $scope.save = function(data , app) { // callback function for the inner table directive
    dataToSend = {
      name : data.name,
      description : data.description,
      fieldType : data.fieldType,
      app: app,
      flag : data.flag
    }
    if (data.fieldType != 'flag') {
      dataToSend.value = data.value;
    }
    $http({method: 'POST' , url : '/api/ERP/appSettingsAdminMode/' , data : dataToSend}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText );
      $scope.tableData.push(response.data)
      $scope.delete(-1,$scope.editor.index);
      $scope.editor.index = -1;
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    })
  };

  $scope.update = function(data ){
    dataToSend = {
      flag : data.flag,
      description : data.description,
      fieldType : data.fieldType,
    }
    if (data.value != null && data.value.length!=0) {
      dataToSend.value = data.value;
    }

    $http({method : 'PATCH' , url : '/api/ERP/appSettingsAdminMode/' + data.pk + '/' , data : dataToSend}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText );
      $scope.editor.index = -1;
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    })
  }

})

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

  as = $permissions.app();
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
