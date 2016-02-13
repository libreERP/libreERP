app.controller('controller.ecommerce.details' , function($scope , $state , $http , $timeout , $uibModal , Flash , $window , $anchorScroll, $location ){

  $scope.ratings = {spread : [4,2,6,1,0] , overall : 5};

  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime
  $window.scrollTo(0,0)
  $http({method : 'GET' , url : '/api/ecommerce/listing/'+ $state.params.id +'/'}).
  then(function(response){
    d = response.data;
    d.specifications = JSON.parse(d.specifications);
    d.pictureInView = 0;
    min = d.providerOptions[0].rate;
    index = 0;
    for (var i =0; i < d.providerOptions.length; i++) {
      if ($scope.data.pickUpTime == null || $scope.data.dropInTime == null) {
        d.providerOptions[i].available = 'error';
      } else {
        dataToSend = {
          start : $scope.data.pickUpTime,
          end : $scope.data.dropInTime,
          offering : d.providerOptions[i].pk,
        }
        $http({method : 'GET' , url : '/api/ecommerce/offeringAvailability/?mode=time' , params : dataToSend}).
        then((function(i){
          return function(response){
            $scope.data.providerOptions[i].available = response.data.available;
          }
        })(i))
        d.providerOptions[i].available = true;
      }
      if (d.providerOptions[i].rate <min){
        index = i;
        min = d.providerOptions[i].rate;
      }
    }
    $scope.data = d;
    $scope.offeringInView = index;
  });


  $scope.changePicture = function(pic){
    $scope.data.pictureInView = pic;
  }

  $scope.showGoToTop = false;
  $scope.$watch(function(){
    if ( $window.pageYOffset > 0 ) {
      $scope.showGoToTop = true;
    } else {
      $scope.showGoToTop = false;
    }
    return null;
  })

  // $scope.data = [300, 500, 100];
  // $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];

  $scope.goToTop = function() {
    $window.scrollTo(0,0)
  }

  $scope.addToCart = function(input){
    dataToSend = {
      category : 'cart',
      user : getPK($scope.me.url),
      item : input.pk,
    }
    $http({method : 'POST' , url : '/api/ecommerce/saved/' , data : dataToSend }).
    then(function(response){
      for (var i = 0; i < $scope.inCart.length; i++) {
        if ($scope.$parent.inCart[i].id == response.data.id){
          Flash.create('danger' , 'Already in the cart.')
          return;
        }
      }
      $scope.$parent.inCart.push(response.data);
      Flash.create('success' , 'Ok')
    })
  }

  $scope.buy = function(input){
    $state.go('checkout' , {pk : input.pk})
  }







});
