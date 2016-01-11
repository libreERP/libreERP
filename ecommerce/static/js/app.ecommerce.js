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
    templateUrl: '/static/ngTemplates/app.ecommerce.list.html',
    controller: 'controller.ecommerce.list'
  })

  $stateProvider
  .state('checkout', {
    url: "/checkout/:pk",
    templateUrl: '/static/ngTemplates/app.ecommerce.checkout.html',
    controller: 'controller.ecommerce.checkout'
  })
});


app.controller('controller.ecommerce.checkout' , function($scope , $state , $aside , $http , $timeout , $uibModal , $users , Flash){
  $scope.me = $users.get('mySelf');
  $scope.data = {quantity : 1 , expresShipping : false , normalShipping : true , stage : 'review'};

  $http({method : 'GET' , url : '/api/ecommerce/listing/' + $state.params.pk + '/'}).
  then(function(response){
    $scope.item = response.data;
  })

  $scope.next = function(){
    if ($scope.data.stage == 'review') {
      $scope.data.stage = 'shippingDetails';
    } else if ($scope.data.stage == 'shippingDetails') {
      $scope.data.stage = 'payment';
    }
  }
  $scope.prev = function(){
    if ($scope.data.stage == 'shippingDetails') {
      $scope.data.stage = 'review';
    } else if ($scope.data.stage == 'payment') {
      $scope.data.stage = 'shippingDetails';
    }
  }

  $scope.pay = function(){
    dataToSend = {
      user : getPK($scope.me.url),
      item : $scope.item.pk,
      parentType : 'COD',
    }
    $http({method : 'POST' , url : '/api/ecommerce/order/' , data : dataToSend}).
    then(function(response){
      $scope.data.stage = 'confirmation';
      $scope.data.order = response.data;
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


})


app.controller('ecommerce.main' , function($scope , $state , $aside , $http , $timeout , $uibModal , $users){
  $scope.me = $users.get('mySelf')
  $scope.inCart = [];

  $http({method : 'GET' , url : '/api/ecommerce/saved/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i].category=='cart'){
        $scope.inCart.push(response.data[i])
      }
    }
  })

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

app.controller('controller.ecommerce.list' , function($scope , $state , $http , $users){


  console.log("public");
  $scope.listings = [];
  $scope.me = $users.get('mySelf');

  $scope.addToCart = function(input){
    dataToSend = {
      category : 'cart',
      user : getPK($scope.me.url),
      item : input.pk,
    }
    $http({method : 'POST' , url : '/api/ecommerce/saved/' , data : dataToSend }).
    then(function(response){
      for (var i = 0; i < $scope.inCart.length; i++) {
        if ($scope.inCart[i].pk == response.data.pk){
          return;
        }
      }
      $scope.inCart.push(response.data);
    })
  }

  $scope.buy = function(input){
    $state.go('checkout' , {pk : input.pk})
  }

  $scope.changePicture = function(parent , pic){
    $scope.listings[$scope.listings.indexOf(parent)].pictureInView = pic;
  }


  $http({method : "GET" , url : '/api/ecommerce/listing/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      l = response.data[i];
      l.specifications = JSON.parse(l.specifications);
      l.pictureInView = 0;
      $scope.listings.push(l);
    }
  })

});
