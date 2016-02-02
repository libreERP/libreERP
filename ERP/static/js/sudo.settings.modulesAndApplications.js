
app.controller('admin.settings.modulesAndApps' , function($scope , $http , $aside , $state , Flash , $users , $filter){

  $scope.url = '/api/ERP/applicationAdminMode/';

  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.ERP.settings.modulesAndApps.item.html',
  },];

  editorTemplate ='/static/ngTemplates/app.ERP.settings.modulesAndApps.form.html',

  $scope.config = {
    url : $scope.url ,
    views : views ,
    searchField : 'name',
    editorTemplate : editorTemplate,
    canCreate : true,
  };


  $scope.rowInput = { // row input is available as rowScope in the main table scope and later fused with the rowScopes

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
      $http({method : 'PATCH' , url : $scope.url + data.pk + '/' , data : dataToSend}).
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
          dataToSend.name = type + '.' + data.name;
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

app.controller('sudo.admin.settings.modulesAndApplications.editor' , function($scope , $http , $aside , $state , Flash , $users , $filter){

  $scope.ownersSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query)
  };
  $scope.appSearch = function(query) {
    return $http.get('/api/ERP/applicationAdminMode/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  }
  $scope.moduleSearch = function(query) {
    return $http.get('/api/ERP/module/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  };
  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/app.ERP.settings.modulesAndApps.settingsFields.html' ,
  },];

  url = '/api/ERP/appSettingsAdminMode/';
  getParams = [{key : 'app' , value :$scope.$parent.data.pk}];
  editorTemplate ='/static/ngTemplates/app.ERP.settings.modulesAndApps.form.html',

  $scope.config = {
    url : url ,
    views : views ,
    searchField : 'name',
    editorTemplate : editorTemplate,
    getParams : getParams,
  };

})

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
