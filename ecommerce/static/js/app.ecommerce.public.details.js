app.controller('controller.ecommerce.details' , function($scope , $state , $http , $timeout , $uibModal , Flash , $window , $anchorScroll, $location , $aside){

  $scope.ratings = { meta : [5,4,3,2,1] , counts : [0,0,0,0,0] , averageRating : 0 };
  $scope.form = {rating : 0 , reviewText : '' , reviewEditor : false , ratable : true}
  $scope.reviewsPage = 0;
  $scope.reviewsCount = 0;

  console.log($scope);

  $scope.getDateTime = function() {
    $scope.data.pickUpTime = $scope.$parent.data.pickUpTime;
    $scope.data.dropInTime = $scope.$parent.data.dropInTime;
    $scope.data.location = $scope.$parent.data.location;
  }

  $scope.$watch($scope.getDateTime)

  $scope.rentOut = function() {
    $aside.open({
      templateUrl : '/static/ngTemplates/app.ecommerce.aside.rentOut.html',
      placement: 'right',
      size: 'lg',
      resolve: {
        input : function() {
          return {pk : $scope.data.pk}
        }
      },
      controller : 'controller.ecommerce.rentOut'
    })
  }

  $scope.showMap = function(index) {
    $aside.open({
      template: '<ui-gmap-google-map center="map.center" class="asideModal" ng-if="render" zoom="map.zoom" draggable="true" events="events" options="options">' +
        '<ui-gmap-marker coords="marker.coords" options="marker.options" events="marker.events" idkey="marker.id">' +
        '</ui-gmap-marker>' +
        '</ui-gmap-google-map>',
      controller: function($scope, input) {
        $scope.events = {
          tilesloaded: function(map) {
            $scope.$apply(function() {
              google.maps.event.trigger(map, "resize");
            });
          }
        }
        $scope.render = true;
        $scope.map = {
          center: {
            latitude: input.address.lat,
            longitude: input.address.lon
          },
          zoom: 14
        };
        $scope.marker = {
          id: 0,
          coords: {
            latitude: input.address.lat,
            longitude: input.address.lon
          },
        };
      },
      placement: 'right',
      size: 'lg',
      resolve: {
        input: function() {
          return $scope.data.providerOptions[index].service;
        }
      }
    });
  }

  $scope.$watch('data.pickUpTime' , function(newValue , oldValue) {
    if ($scope.data.pickUpTime!= null && $scope.data.dropInTime!= null) {
      $scope.refreshMainView()
    }
  });
  $scope.$watch('data.dropInTime' , function(newValue , oldValue) {
    if ($scope.data.pickUpTime!= null && $scope.data.dropInTime!= null) {
      $scope.refreshMainView()
    }
  });


  $scope.nextReviews = function() {
    if ($scope.reviewsCount > ($scope.reviewsPage+1)*5) {
      $scope.reviewsPage += 1;
      $scope.fetchReviews();
    }
  }
  $scope.prevReviews = function() {
    if ($scope.reviewsPage > 0) {
      $scope.reviewsPage -= 1;
      $scope.fetchReviews();
    }
  }

  $scope.fetchReviews = function() {
    $http({method : 'GET' , url : '/api/ecommerce/review/?listing=' + $scope.data.pk + '&limit=5&offset=' + $scope.reviewsPage * 5 }).
    then(function(response) {
      $scope.data.reviews = response.data.results;
      $scope.reviewsCount = response.data.count;
    });
  }

  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime



  $scope.refreshMainView = function() {

    $scope.getDateTime();

    d = $scope.data;
    if (typeof d.specifications == 'string') {
      d.specifications = JSON.parse(d.specifications);
    }
    if (typeof d.providerOptions == 'undefined') {
      return;
    }
    d.pictureInView = 0;
    min = d.providerOptions[0].rate;
    index = 0;
    for (var i =0; i < d.providerOptions.length; i++) {
      if ($scope.data.pickUpTime == null || $scope.data.dropInTime == null || ($scope.data.dropInTime-$scope.data.pickUpTime)<0) {
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
      }
      if (d.providerOptions[i].rate <min){
        index = i;
        min = d.providerOptions[i].rate;
      }
    }

    $scope.offeringInView = index;
  }


  $http({method : 'GET' , url : '/api/ecommerce/listing/'+ $state.params.id +'/'}).
  then(function(response){
    $scope.data = response.data;
    $scope.refreshMainView()
    $scope.fetchReviews();
    $http({method : 'GET' , url : '/api/ecommerce/insight/?mode=public&listing=' + $scope.data.pk}).
    then(function(response) {
      $scope.ratings.counts = response.data.counts;
      $scope.ratings.averageRating = response.data.averageRating;
    });
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

  $scope.sendReview = function(mode) {
    dataToSend = {
      item : $scope.data.pk,
    }
    if (mode == 'rating') {
      if ($scope.form.rating == 0 || !$scope.form.ratable) {
        return;
      }
      dataToSend.rating = $scope.form.rating;
    }else {
      if ($scope.form.reviewText == '' || $scope.form.reviewHeading == '') {
        Flash.create('danger' , 'No review to post.')
        return;
      }
      dataToSend.text = $scope.form.reviewText;
      dataToSend.heading = $scope.form.reviewHeading;
    }
    $http({method : 'POST' , url : '/api/ecommerce/review/' , data : dataToSend}).
    then(function(response) {
      Flash.create('success' , 'Thanks for sharing your experience!')
      $scope.form.ratable = false;
      $scope.form.reviewEditor = false;
    });
  };


  $scope.goToTop = function() {
    $window.scrollTo(0,0);
  };

  $scope.goToTop();

  $scope.addToCart = function(input){
    dataToSend = {
      category : 'cart',
      user : getPK($scope.me.url),
      item : input.pk,
      start : $scope.$parent.data.pickUpTime,
      end : $scope.$parent.data.dropInTime,
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

  $scope.refreshMainView()






});

app.controller('controller.ecommerce.rentOut' , function($scope , Flash , $http , input) {
  $scope.registered = null;
  $scope.registrationStage = 'location';
  $scope.data = {agreed : false , location : null , contactRequired : false , mobile : '' , parentPK : input.pk};

  $http({method : 'GET' , url : '/api/ecommerce/providerRegistration/'}).
  then(function(response) {
    $scope.registered = true;
  }, function(response) {
    $scope.registered = false;
  })

  $scope.agree = function() {
    if (!$scope.data.agreed) {
      Flash.create('danger' , 'Please accept the terms and conditions')
      return;
    }
    $scope.registrationStage = 'location';
  }

  $scope.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 8 };
  $scope.marker = {
    id: 0,
    coords: {
      latitude: 20,
      longitude: 78
    },
  };
  $scope.windowOptions = {
    visible: false,
  };


  $scope.getLocationSuggeations = function(query){
    return $http.get('/api/ecommerce/suggestLocations/?query=' + query).
    then(function(response){
      return response.data.predictions;
    })
  }

  $scope.$watch('data.location' , function(newValue, oldValue){
    if (newValue != null && typeof newValue =='object') {
      $http({method : 'GET' , url : '/api/ecommerce/locationDetails/?id=' + newValue.place_id}).
      then(function(response){
        // $scope.params.location = response.data.result;
        $scope.map.center.latitude = response.data.result.geometry.location.lat;
        $scope.map.center.longitude = response.data.result.geometry.location.lng;
      })
    }else {
      // $scope.params.location = null;
    }
  }, true);

  $scope.register = function() {
    $http({
      method: 'GET',
      url: '/api/ecommerce/profile/'
    }).
    then(function(response) {
      // for(key in response.data[0])
      dataToSend = {
        lat : $scope.map.center.latitude,
        lon : $scope.map.center.longitude
      }
      $scope.customerProfile = response.data[0];
      $http({method : 'PATCH' , url : '/api/ecommerce/profile/' + response.data[0].pk + '/' , data : dataToSend }).
      then(function(response) {
        if ($scope.data.contactRequired) {
          if ($scope.data.mobile.length == 0) {
            Flash.create('danger' , 'Mobile no. field cannot be empty')
            return;
          }else{
            dataToSend = {mobile : $scope.data.mobile}
          }
        }
        $http({method : 'POST' , url : '/api/ecommerce/providerRegistration/' , data : dataToSend}).
        then(function(response) {

        } , function(response) {
          if ('mobile' in response.data){
            Flash.create('danger' , 'Looks like we dont have your contact number, Please enter one.')
            $scope.data.contactRequired = true;
            // $scope.registered = true;
          }
        })
      })
    })

  }

  $scope.resetForm = function(){
    $scope.data.form = {
      shippingOptions : 'pickup',
      availability : 'local',
      rate : null,
      freeReturns : false,
      replacementPeriod : 0,
      shippingFee : 0,
      inStock : 1,
      start : new Date(),
      end : new Date()
    }
  }

  $scope.resetForm()

  $scope.offer = function() {
    dataToSend = $scope.data.form;
    var post = {method : 'POST' , url : '/api/ecommerce/offeringAdmin/'}
    dataToSend.item = $scope.data.parentPK;
    $http({method : post.method , url : post.url , data : $scope.data.form}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


});
