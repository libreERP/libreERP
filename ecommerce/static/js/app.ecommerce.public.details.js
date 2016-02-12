app.controller('controller.ecommerce.details' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash , $window){

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
    console.log(d);
    $scope.data = d;
    $scope.offeringInView = index;
  });


  $scope.changePicture = function(pic){
    $scope.data.pictureInView = pic;
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







});
