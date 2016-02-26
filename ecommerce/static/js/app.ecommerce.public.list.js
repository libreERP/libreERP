app.controller('controller.ecommerce.list' , function($scope , $state , $http , $users , Flash){
  console.log("loaded");

  console.log($scope);

  $scope.fetchListings = function(){
    url = '/api/ecommerce/listingSearch/?'
    $scope.listings = [];
    if ($scope.$parent.params.location != null) {
      l = $scope.$parent.params.location.geometry.location
      if (typeof location != 'undefiner' && location != null && typeof location!='string') {
        // pin = parent.params.location.formatted_address.match(/[0-9]{6}/);
        lat = l.lat
        lon = l.lng
        url += 'lat=' + lat + '&lon=' + lon;

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
    } , function(response) {
      Flash.create('danger' , 'No location provided')
      $state.go('ecommerce')
    })
  }

  $scope.listings = [];
  $scope.me = $users.get('mySelf');


  $scope.fetchListings()


});
