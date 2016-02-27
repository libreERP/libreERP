var app = angular.module('app' , ['ui.router', 'ui.bootstrap' ,'flash' ,'ngSanitize', 'ngAnimate', 'anim-in-out' ,'ui.bootstrap.datetimepicker' , 'chart.js' , 'uiGmapgoogle-maps', 'ngAside']);

app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide){

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run([ '$rootScope', '$state', '$stateParams' , function ($rootScope,   $state,   $stateParams ) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
  }
]);

app.config(function($stateProvider ){

  $stateProvider
  .state('ecommerce', {
    url: "/",
    templateUrl: '/static/ngTemplates/app.ecommerce.home.html',
    controller: 'controller.ecommerce.home'
  })

  $stateProvider
  .state('list', {
    url: "/list",
    templateUrl: '/static/ngTemplates/app.ecommerce.list.html',
    controller: 'controller.ecommerce.list'
  })

  $stateProvider
  .state('details', {
    url: "/details/:id",
    templateUrl: '/static/ngTemplates/app.ecommerce.details.html',
    controller: 'controller.ecommerce.details'
  })

  $stateProvider
  .state('checkout', {
    url: "/checkout/:pk",
    templateUrl: '/static/ngTemplates/app.ecommerce.checkout.html',
    controller: 'controller.ecommerce.checkout'
  })

  $stateProvider
  .state('pages', {
    url: "/pages/:title",
    templateUrl: '/static/ngTemplates/app.ecommerce.pages.html',
    controller: 'controller.ecommerce.pages'
  })

  $stateProvider
  .state('account', {
    url: "/account",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.html',
       },
       "menu@account": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.menu.html',
        },
        "@account": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.default.html',
        }
    }
  })

  .state('account.cart', {
    url: "/cart",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.cart.html',
    controller: 'controller.ecommerce.account.cart'
  })
  .state('account.orders', {
    url: "/orders",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.orders.html',
    controller: 'controller.ecommerce.account.orders'
  })
  .state('account.settings', {
    url: "/settings",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.settings.html',
    controller: 'controller.ecommerce.account.settings'
  })
  .state('account.support', {
    url: "/support",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.support.html',
    controller: 'controller.ecommerce.account.support'
  })

});
