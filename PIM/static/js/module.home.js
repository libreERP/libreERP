app.config(function($stateProvider ){

  $stateProvider
  .state('home', {
    url: "/home",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/home.html',
      },
      "menu@home": {
        templateUrl: '/static/ngTemplates/home.menu.html',
      },
      "@home": {
        templateUrl: '/static/ngTemplates/app.home.dashboard.html',
        controller : 'home.dash'
      }
    }
  })
  .state('home.mail', {
    url: "/mail/{folder}?action",
    templateUrl: '/static/ngTemplates/app.mail.html',
    controller: 'controller.mail'
  })
  .state('home.social', {
    url: "/social/:id",
    templateUrl: '/static/ngTemplates/app.social.html',
    controller: 'controller.social'
  })
  .state('home.news', {
    url: "/news",
    templateUrl: '/static/ngTemplates/app.home.blog.html',
    controller: 'home.blog'
  })
  .state('home.calendar', {
    url: "/calendar",
    templateUrl: '/static/ngTemplates/app.home.calendar.html',
    controller: 'home.calendar'
  })
  .state('home.notes', {
    url: "/notes",
    template: '<breadcrumb></breadcrumb><div> Loren Ipsum Text in the dash board</div>',
    controller: 'home.notes'
  })

});

app.controller("home.dash", function($scope , $state) {

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.labels2 = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data2 = [300, 500, 100];

})
app.controller("home.mail", function($scope , $state) {

})
app.controller("home.social", function($scope , $state) {

})
app.controller("home.news", function($scope , $state) {

})

app.controller("home.notes", function($scope , $state) {
})
