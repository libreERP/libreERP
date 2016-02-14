app.controller('controller.ecommerce.details' , function($scope , $state , $http , $timeout , $uibModal , Flash , $window , $anchorScroll, $location ){

  $scope.ratings = { meta : [5,4,3,2,1] , counts : [0,0,0,0,0] , averageRating : 0 };
  $scope.form = {rating : 0 , reviewText : '' , reviewEditor : false , ratable : true}
  $scope.reviewsPage = 0;
  $scope.reviewsCount = 0;
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
  // $window.scrollTo(0,0)
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







});
