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

  .state('admin.globalSettings', {
    url: "/globalSettings",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.ERP.settings.html',
       },
       "menu@admin.globalSettings": {
          templateUrl: '/static/ngTemplates/app.ERP.settings.menu.html',
          controller : 'admin.globalSettings'
        },
        "@admin.globalSettings": {
          templateUrl: '/static/ngTemplates/app.ERP.settings.default.html',
        }
    }
  })

  .state('admin.globalSettings.modulesAndApplications', {
    url: "/modulesAndApplications",
    templateUrl: '/static/ngTemplates/app.ERP.settings.modulesAndApps.html',
    controller: 'admin.globalSettings.modulesAndApps'
  })
  .state('admin.globalSettings.configure', {
    url: "/configure?app&canConfigure",
    templateUrl: '/static/ngTemplates/app.ERP.settings.configure.html',
    controller: 'admin.globalSettings.configure'
  })

});

app.controller('admin' , function($scope , userProfileService , Flash){
  // main admin tab default page controller
});
