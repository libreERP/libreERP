
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
    itemsNumPerView : [6,12,24]
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
        haveJs : data.haveJs,
        haveCss : data.haveCss,
        inMenu : data.inMenu,
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
        $scope.$broadcast('forceSetFormData', { icon : '' , name : '' , description : '' , module : '' , type : 'module' , app : '' , haveJs : false , haveCss : false , inMenu : false });
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
    return $http.get('/api/ERP/module/?mode=search&name__contains=' + query).
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
  $scope.editor = {index : -1};

  $scope.new = function(){
    $scope.data.push({pk : 0 ,name:'', flag: false ,value:'',description:'' , fieldType:'flag' , new : true});
    $scope.editor.index = $scope.data.length-1;
  }

  $scope.cancel = function(input) {
    if (input == $scope.editor.index && !$scope.data[input].new) {
      $scope.data[input].flag= $scope.editor.flag;
      $scope.data[input].description = $scope.editor.description;
      $scope.data[input].value=$scope.editor.value;
    }else {
      // $index == editor.index && row.pk==0 && row.new
      $scope.data.splice(input,1);
    }
    $scope.editor.index =-1
  }

  $scope.edit = function(input) {
    $scope.editor.index = input;
    $scope.editor.flag = $scope.data[input].flag;
    $scope.editor.description = $scope.data[input].description;
    $scope.editor.value = $scope.data[input].value;
  }

  $scope.delete = function(input) {
    if ($scope.data[input].pk == 0) {
      $scope.data.splice(input , 1)
    }else {
      $http({method : 'DELETE' , url : '/api/ERP/appSettingsAdminMode/' + $scope.data[input].pk + '/'}).
      then((function(input){
        return function(response) {
          $scope.data.splice(input ,1)
          Flash.create('success', response.status + ' : ' + response.statusText );
        }
      })(input) , function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText );
      })
    }
  };


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
      $scope.data.push(response.data)
      for (var i = 0; i < $scope.data.length; i++) {
        if ($scope.data[i].pk==0){
          $scope.data.splice(i,1)
        }
      }
      $scope.editor.index=-1;
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
