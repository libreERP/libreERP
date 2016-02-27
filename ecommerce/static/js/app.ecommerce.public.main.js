app.controller('ecommerce.main' , function($scope , $state , $http , $timeout , $uibModal , $users , $interval , Flash){
  $scope.me = $users.get('mySelf')
  $scope.inCart = [];
  $scope.data = {location : null}
  $scope.params = {location : null} // to be used to store different parameter by the users on which the search result will be filtered out



  $scope.slide = {banners : [] , active : 0};

  $http({method : 'GET' , url : '/api/ecommerce/offerBanner/'}).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      s = response.data[i].params;
      s = s.split(':')[1];
      s = s.split('}')[0];
      response.data[i].params = {id : parseInt(s)}
    }
    $scope.slide.banners = response.data;
  })
  $scope.changeSlide = function(index){
    $scope.slide.active = index;
  }

  $interval(function () {
    $scope.slide.active += 1;
    if ($scope.slide.active == 5) {
      $scope.slide.active = 0;
    }
  }, 5000);

  $scope.feedback = {email : '' , mobile : null , message : ''};

  $scope.sendFeedback = function() {
    dataToSend = {
      email : $scope.feedback.email,
      mobile : $scope.feedback.mobile,
      message : $scope.feedback.message,
    }

    $http({method : 'POST' , url : '/api/ecommerce/feedback/' , data : dataToSend }).
    then(function(response) {
      Flash.create('success', 'Thank you!');
      $scope.feedback = {email : '' , mobile : null , message : ''};
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.settings = {};
  $http({method : 'GET' , url : '/api/ERP/appSettings/?app=25'}).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      $scope.settings[response.data[i].name] = response.data[i].value;
    }
  })

  $scope.data.pickUpTime = null;
  $scope.data.dropInTime = null;

  $http({method : 'GET' , url : '/api/ecommerce/saved/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i].category=='cart'){
        $scope.inCart.push(response.data[i])
      }
    }
  })

  $scope.headerUrl = '/static/ngTemplates/app.ecommerce.header.html';
  $scope.footerUrl = '/static/ngTemplates/app.ecommerce.footer.html';

  $scope.$watch('data.location' , function(newValue, oldValue){
    if (newValue != null && typeof newValue =='object') {
      $http({method : 'GET' , url : '/api/ecommerce/locationDetails/?id=' + newValue.place_id}).
      then(function(response){
        $scope.params.location = response.data.result;
      })
    }else {
      $scope.params.location = null;
    }
  }, true);

  $scope.getLocationSuggeations = function(query){
    return $http.get('/api/ecommerce/suggestLocations/?query=' + query).
    then(function(response){
      return response.data.predictions;
    })
  }

  $scope.getDateTimePickerClass = function() {
    if ($scope.data.pickUpTime && $scope.data.dropInTime && ($scope.data.dropInTime-$scope.data.pickUpTime)<0) {
      return 'text-danger';
    }
  }

  $scope.checkDateTime = function() {
    if ($scope.data.pickUpTime && $scope.data.dropInTime && ($scope.data.dropInTime-$scope.data.pickUpTime)<0) {
      Flash.create('danger', " Trip can not end before start please check the drop in time");
    }
  }

  $scope.refreshResults = function(){
    if ($state.is('ecommerce') && $scope.params.location == null) {
      Flash.create('danger', " No location selected");
      return;
    }
    $state.go('list' , {} , {reload : true})
    // if (angular.isDefined($scope.$$childHead.fetchListings)) {
    //   $scope.$$childHead.fetchListings()
    // }else {
    //   $scope.$$childTail.fetchListings()
    // }
  }

});

app.controller('controller.ecommerce.pages' , function($scope , $state , $http , $timeout , $uibModal , $users , $interval , Flash , $window , $log){
  $scope.templateUrl = '/static/ngTemplates/app.ecommerce.pages.'+ $state.params.title + '.html' ;
  $window.scrollTo(0,0);
  $scope.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 6 };
  $scope.marker = {
    id: 0,
    coords: {
      latitude: 40.1451,
      longitude: -99.6680
    },
  };
  $scope.windowOptions = {
    visible: false,
  };

})
