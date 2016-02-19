app.controller('controller.ecommerce.home' , function($scope , $state , $http , $users){
  $scope.fetchListings = function(){
    url = '/api/ecommerce/listingLite/?'
    $scope.listings = [];
    parent = $scope.$parent;
    if (parent.data.location != null && typeof parent.data.location!='string') {
      l = parent.data.location;
      pin = parent.params.location.formatted_address.match(/[0-9]{6}/);
      if (pin != null) {
        url += 'geo=' + pin[0].substring(0,3);
      } else {
        return;
      }

    }

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
