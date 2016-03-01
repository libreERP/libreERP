app.controller('controller.ecommerce.checkout' , function($scope , $state, $http , $timeout , $uibModal , $users , Flash){
  $scope.me = $users.get('mySelf');
  $scope.data = {quantity : 1 , shipping :'express', stage : 'review' , address : { street : '' , pincode : '' , city : '' , state : '', mobile :'' , attachment : emptyFile}};

  $scope.$watch(function(){
    if (typeof $scope.$parent.data.pickUpTime == 'string') {
      $scope.data.pickUpTime = new Date($scope.$parent.data.pickUpTime);
    }else{
      $scope.data.pickUpTime = $scope.$parent.data.pickUpTime;
    }
    if (typeof $scope.$parent.data.dropInTime == 'string') {
      $scope.data.dropInTime = new Date($scope.$parent.data.dropInTime);
    }else {
      $scope.data.dropInTime = $scope.$parent.data.dropInTime;
    }
    $scope.data.location = $scope.$parent.data.location;
  })

  $scope.uploadAttachment = function() {
    if ($scope.data.attachment == emptyFile || $scope.data.attachment == null || typeof $scope.data.attachment == 'undefined') {
      Flash.create('danger' , 'No file selected')
      return;
    }

    var fd = new FormData();
    fd.append( 'mediaType' , 'doc');
    fd.append( 'attachment' ,$scope.data.attachment);

    url = '/api/ecommerce/media/';

    $http({method : 'POST' , url : url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.attachment = response.data;
      url =  $scope.attachment.attachment;
      $scope.attachment.name = url.split('/')[url.split('/').length -1]
      dataToSend = {
        attachment : response.data.pk
      }
      $http({method : 'PATCH' , url : '/api/ecommerce/profile/' + $scope.customerProfile.pk + '/', data : dataToSend }).
      then(function(response) {
        $scope.customerProfile = response.data;
        $scope.data.address = response.data.address;
        Flash.create('success', response.status + ' : ' + response.statusText);
      } , function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });

  }

  $scope.retriveProfile = function() {
    $http({method : 'GET' , url : '/api/ecommerce/profile/'}).
    then(function(response){
      $scope.customerProfile = response.data[0];
      $scope.data.address = response.data[0].address;
      if (response.data[0].attachment == null || typeof response.data[0].attachment == 'undefined' || response.data[0].attachment.length == 0) {
        return;
      }
      $http({method : 'GET' , url : '/api/ecommerce/media/' + response.data[0].attachment + '/'}).
      then(function(response) {
        $scope.attachment = response.data;
        url =  $scope.attachment.attachment;
        $scope.attachment.name = url.split('/')[url.split('/').length -1]
      })
    })
  }

  $scope.retriveProfile()

  $http({method : 'GET' , url : '/api/ecommerce/offering/' + $state.params.pk + '/'}).
  then(function(response){
    $scope.offering = response.data;
    $scope.getBookingAmount = function(){
      h = Math.ceil(($scope.data.dropInTime-$scope.data.pickUpTime)/3600000);
      if (h<0){
        return 0
      }else {
        return $scope.offering.rate * $scope.data.quantity*h;
      }
    }

    $http({method : 'GET' , url : '/api/ecommerce/listing/' + response.data.item + '/'}).
    then(function(response){
      $scope.item = response.data;
    })
  })


  $scope.next = function(){
    if ($scope.data.stage == 'review') {
      if ($scope.data.location == null || $scope.data.pickUpTime == null || $scope.data.dropInTime == null) {
        if ($scope.data.location == null) {
          msg = 'Location not selected'
        }else if ($scope.data.pickUpTime == null) {
          msg = 'Pickup time not selected'
        }else if ($scope.data.dropInTime == null) {
          msg = 'Dropin time not selected'
        }
        Flash.create('danger' , msg)
        return;
      }
      $scope.data.stage = 'shippingDetails';
    } else if ($scope.data.stage == 'shippingDetails') {
      if ($scope.customerProfile.attachment == null || typeof $scope.customerProfile.attachment == 'undefined' || $scope.customerProfile.attachment.length == 0) {
        Flash.create('danger' , 'No driving license found')
        return;
      }
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

    $scope.data.stage = 'processing';

    $scope.data.pickUpTime = $scope.$parent.data.pickUpTime;
    $scope.data.dropInTime = $scope.$parent.data.dropInTime;
    $scope.data.location = $scope.$parent.data.location;

    if ($scope.data.pickUpTime == null || $scope.data.dropInTime== null) {
      Flash.create('danger' , 'No start date and end date provided');
      return;
    }
    dataToSend = {
      user : getPK($scope.me.url),
      offer : $scope.offering.pk,
      paymentType : 'COD',
      rate : $scope.offering.rate,
      quantity : $scope.data.quantity,
      mobile : $scope.customerProfile.mobile,
      coupon : $scope.data.coupon,
      shipping : $scope.data.shipping,
      start : $scope.data.pickUpTime,
      end : $scope.data.dropInTime,
    }
    for (key in $scope.data.address) {
      if (key == 'pk') {
        continue;
      }
      dataToSend[key] = $scope.data.address[key];
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
