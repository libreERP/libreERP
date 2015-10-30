app.config(function($stateProvider){

  $stateProvider
  .state('admin', {
    url: "/admin",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/admin.html',
          controller: 'admin'
       },
       "menu@admin": {
          templateUrl: '/static/ngTemplates/adminMenu.html',
        }
    }
  })

  .state('admin.search', {
    url: "/search",
    template: '<div> Loren Ipsum Text</div>',
    controller: 'admin.search'
  })

  .state('admin.manageUser', {
    url: "/manageUser",
    templateUrl: '/static/ngTemplates/admin.createUser.html',
    controller: 'admin.manageUser'
  })

});

app.controller('admin' , function($scope ){
  console.log("Amin controller initiated");
});

app.controller('admin.manageUser' , function($scope ){
});
app.controller('admin.search' , function($scope ){

});
