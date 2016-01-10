var app = angular.module('app' , ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside' , 'flash'  , 'textAngular' , 'chart.js' , 'ngTagsInput' , 'ui.tinymce']);

app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide){

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
    taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo'],
      ['justifyLeft', 'justifyCenter', 'justifyRight'],[ 'indent', 'outdent', 'insertLink'],
    ];
    return taOptions;
  }]);


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
    templateUrl: '/static/ngTemplates/app.ecommerce.html',
    controller: 'controller.ecommerce.public'
  })


});

app.controller('main' , function($scope , $state , $aside , $http , $timeout , $uibModal ){
  console.log("main");
  $scope.headerUrl = '/static/ngTemplates/app.ecommerce.header.html';
  $scope.footerUrl = '/static/ngTemplates/app.ecommerce.footer.html';

  $scope.getLocationSuggeation = function(query){
    return $http.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode&language=in&key=AIzaSyDqZoDeSwSbtfkFawD-VoO7nx2WLD3mCgU&input=' + query).
    then(function(response){
      return response.data;
    })
  }

});

app.controller('controller.ecommerce.public' , function($scope , $state , $http){
  console.log("public");
  $scope.listings = [];
  $http({method : "GET" , url : '/api/ecommerce/listing/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      l = response.data[i];
      l.specifications = JSON.parse(l.specifications);
      $scope.listings.push(l);
    }
  })

});
