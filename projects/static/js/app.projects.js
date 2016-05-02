app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement.projects', {
    url: "/projects",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.projects.html',
       },
       "menu@projectManagement.projects": {
          templateUrl: '/static/ngTemplates/app.projects.menu.html',
          controller : 'projectManagement.projects.menu',
        },
        "@projectManagement.projects": {
          templateUrl: '/static/ngTemplates/app.projects.default.html',
          controller : 'projectManagement.projects.default',
        }
    }
  })
  .state('projectManagement.projects.new', {
    url: "/new",
    templateUrl: '/static/ngTemplates/app.projects.new.html',
    controller: 'projectManagement.projects.new'
  })


});

app.controller('projectManagement.projects.project.explore' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
    $http({method : 'GET' , url : '/api/projects/project/' + $scope.tab.data.pk + '/'}).
    then(function(response) {
        $scope.project = response.data;
    })

});


app.controller('projectManagement.project.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){


});

app.controller('projectManagement.project.modal.project' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

    $scope.save = function() {
        var dataToSend = {
            description : $scope.data.description,
            dueDate : $scope.data.dueDate,
            team : $scope.data.team,
        }
        $http({method : 'PATCH' , url : '/api/projects/project/' + $scope.data.pk + '/' , data : dataToSend}).
        then(function(response) {
            Flash.create('success' , 'Saved');
        })
    }

});


app.controller('projectManagement.projects.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
    $scope.data = {tableData : []};
    var views = [{
      name: 'list',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/genericSearchList.html',
      itemTemplate: '/static/ngTemplates/app.projects.item.html',
    }, ];

    $scope.projectsConfig = {
      views: views,
      url: '/api/projects/project/',
      editorTemplate : '/static/ngTemplates/app.projects.form.project.html',
      searchField: 'title',
    }

    $scope.tableAction = function(target , action , mode){
      if (action == 'projectBrowser') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == parseInt(target)){
            $scope.addTab({title : 'Browse project : ' + $scope.data.tableData[i].title , cancel : true , app : 'projectBrowser' , data : {pk : target , name : $scope.data.tableData[i].title} , active : true})
          }
        }
      }
    }

    $scope.tabs = [];
    $scope.searchTabActive = true;

    $scope.closeTab = function(index){
      $scope.tabs.splice(index , 1)
    }

    $scope.addTab = function( input ){
        console.log(JSON.stringify(input));
      $scope.searchTabActive = false;
      alreadyOpen = false;
      for (var i = 0; i < $scope.tabs.length; i++) {
        if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
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

    $scope.addTab(JSON.parse('{"title":"Browse project : Project 1","cancel":true,"app":"projectBrowser","data":{"pk":1,"name":"Project 1"},"active":true}'))

});


app.controller('projectManagement.projects.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  var getState = function(input){
    var parts = input.name.split('.');
    // console.log(parts);
    return input.name.replace('app' , 'projectManagement')
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || parts.length != 3 || parts[1] != 'projects') {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.app();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };

  $scope.isActive = function(index){
    var app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return  $state.is(app.name.replace('app' , 'projectManagement'))
    }
  }

});
