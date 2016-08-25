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
          controller : 'admin.menu'
        },
        "@admin": {
          templateUrl: '/static/ngTemplates/admin.dash.html',
          controller : 'admin'
        }
    }
  })

  .state('admin.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/app.HR.manage.users.html',
    controller: 'admin.manageUsers'
  })

  .state('admin.settings', {
    url: "/settings",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.ERP.settings.html',
       },
       "menu@admin.settings": {
          templateUrl: '/static/ngTemplates/app.ERP.settings.menu.html',
          controller : 'admin.settings.menu'
        },
        "@admin.settings": {
          templateUrl: '/static/ngTemplates/app.ERP.settings.default.html',
        }
    }
  })

  .state('admin.settings.modulesAndApplications', {
    url: "/modulesAndApplications",
    templateUrl: '/static/ngTemplates/app.ERP.settings.modulesAndApps.html',
    controller: 'admin.settings.modulesAndApps'
  })
  .state('admin.settings.configure', {
    url: "/configure?app&canConfigure",
    templateUrl: '/static/ngTemplates/app.ERP.settings.configure.html',
    controller: 'admin.settings.configure'
  })

});

app.controller('admin' , function($scope , $users , Flash){
  // main admin tab default page controller
});

app.controller('admin.menu' , function($scope , $users , Flash , $permissions){
  // main admin tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 2 || a.name.indexOf('sudo') == -1 || parts.length > 2) {
        continue;
      }
      a.state = a.name.replace('sudo' , 'admin')
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
});
