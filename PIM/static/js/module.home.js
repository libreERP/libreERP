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
        templateUrl: '/static/ngTemplates/dashboard.html',
        controller : 'home.dash'
      }
    }
  })
  .state('home.mail', {
    url: "/mail",
    template: '<breadcrumb></breadcrumb><div> Loren Ipsum Text in the mail board</div>',
    controller: 'home.mail'
  })
  .state('home.social', {
    url: "/social/:id",
    templateUrl: '/static/ngTemplates/app.social.html',
    controller: 'socialController'
  })
  .state('home.news', {
    url: "/news",
    template: '<breadcrumb></breadcrumb><div> Loren Ipsum Text in the dash board</div>',
    controller: 'home.news'
  })
  .state('home.calender', {
    url: "/calender",
    template: '<breadcrumb></breadcrumb><div> Loren Ipsum Text in the dash board</div>',
    controller: 'home.calender'
  })
  .state('home.notes', {
    url: "/notes",
    template: '<breadcrumb></breadcrumb><div> Loren Ipsum Text in the dash board</div>',
    controller: 'home.notes'
  })

});

app.controller("home.dash", function($scope , $state) {
})
app.controller("home.mail", function($scope , $state) {
})
app.controller("home.social", function($scope , $state) {
})
app.controller("home.news", function($scope , $state) {
})
app.controller("home.calender", function($scope , $state) {
})
app.controller("home.notes", function($scope , $state) {
})
