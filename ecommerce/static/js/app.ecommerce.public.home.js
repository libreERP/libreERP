app.controller('controller.ecommerce.home' , function($scope , $state , $http , $users ,$uibModal , $interval){

  $scope.$watch(function() {
    if (typeof $scope.settings == 'undefined' || Object.keys($scope.settings).length==0) {
      $scope.settings = $scope.$parent.settings;
    }
  });

  $scope.openIntroVideo = function() {
    var modalInstance = $uibModal.open({
      template: '<iframe width="100%" style="margin:0px;padding:0px;" height="500" src="https://www.youtube.com/embed/T4IkbcnaeOE" frameborder="0" allowfullscreen></iframe>',
      controller: function($scope , $uibModalInstance) {

      },
      size: 'lg',
    });
  }

  $scope.whyZoomer = 1;
  $interval(function () {
    if ($scope.whyZoomer == 1) {
      $scope.whyZoomer = 2;
    }else if ($scope.whyZoomer == 2) {
      $scope.whyZoomer = 3;
    }else {
      $scope.whyZoomer =1;
    }
  }, 2000);

  $scope.fetchListings = function(){
    url = '/api/ecommerce/listingLite/?mode=suggest'
    $scope.listings = [];

    $http({method : "GET" , url : url}).
    then(function(response){
      for (var i = 0; i < response.data.length; i++) {
        l = response.data[i];
        index = 0
        if (l.providerOptions.length == 0) {
          continue;
        }
        min = l.providerOptions[index].rate;
        for (var j = 1; j < l.providerOptions.length; j++) {
          if (l.providerOptions[j].rate < min) {
            min = l.providerOptions[j].rate;
            index = j;
          }
        }
        l.bestOffer = l.providerOptions[index];
        $scope.listings.push(l);
      }
    })
  }

  $scope.listings = [];
  $scope.me = $users.get('mySelf');

  $scope.fetchListings()


});
