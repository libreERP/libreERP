app.controller('controller.ecommerce.account.cart', function($scope, $state, $http, $timeout, $uibModal, $users, Flash, $window) {
  $window.scrollTo(0, 0)
  views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.account.cart.item.html',
  }, ];

  $scope.cartConfig = {
    views: views,
    url: '/api/ecommerce/saved/',
    // fields : ['pk','fieldType','unit' , 'name' , 'default' , 'helpText'],
    // searchField: 'title',
  }
});

app.controller('controller.ecommerce.account.cart.item', function($scope, $http, $state) {

  $scope.tableData = $scope.$parent.$parent.$parent.$parent.$parent.data;
  $scope.data = $scope.$parent.$parent.data;
  $scope.delete = $scope.$parent.$parent.delete;

  $scope.delete = function() {
    $http({
      method: 'DELETE',
      url: '/api/ecommerce/saved/' + $scope.data.id + '/'
    }).
    then(function(response) {
      for (var i = 0; i < $scope.tableData.length; i++) {
        if ($scope.tableData[i].id == $scope.data.id) {
          $scope.tableData.splice(i, 1);
          $scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.inCart.splice(0, 1);
        }
      }
    });
  }
  $http({
    method: 'GET',
    url: '/api/ecommerce/listingLite/' + $scope.data.item + '/'
  }).
  then(function(response) {
    index = 0
    l = response.data;
    min = l.providerOptions[index].rate;
    for (var j = 1; j < l.providerOptions.length; j++) {
      if (l.providerOptions[j].rate < min) {
        min = l.providerOptions[j].rate;
        index = j;
      }
    }
    l.bestOffer = l.providerOptions[index];
    for (key in l) {
      $scope.data[key] = l[key];
    }
  })

  $scope.view = function() {
    $scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.data.pickUpTime = new Date($scope.data.start);
    $scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.data.dropInTime = new Date($scope.data.end);
    $state.go('details', {
      id: $scope.data.pk
    });
  }
})

app.controller('controller.ecommerce.account.orders.item', function($scope, $state, $http, $timeout, $uibModal, $users, Flash, $location, $aside) {

  $scope.showInfo = false;

  $scope.toggleInfo = function() {
    $scope.showInfo = !$scope.showInfo;
  }

  $scope.cancelBooking = function(input) {
    $http({
      method: 'PATCH',
      url: '/api/ecommerce/order/' + $scope.data.id + '/?mode=consumer',
      data: {
        status: input
      }
    }).
    then(function(response) {
      $scope.data.status = response.data.status;
    });
  }

  $scope.getStatusClass = function(input) {
    if (input == 'inProgress') {
      return 'fa-spin fa-spinner';
    } else if (input == 'complete') {
      return 'fa-check';
    } else if (input == 'canceledByVendor') {
      return 'fa-ban';
    } else if (input == 'new') {
      return 'fa-file'
    } else if (input == 'canceledByCustomer') {
      return 'fa-close'
    }
  }
  $scope.bookingTime = function() {
    return Math.ceil((new Date($scope.data.end) - new Date($scope.data.start)) / 3600000);
  }
  $scope.getBookingAmount = function() {
    h = $scope.bookingTime()
    if (h < 0) {
      return 0
    } else {
      return $scope.data.rate * $scope.data.quantity * h
    }
  }

  $scope.getInvoiceLink = function() {
    return 'api/ecommerce/printInvoice/?id=' + $scope.data.id;
  }

  $scope.$watch('data.offer', function(newValue, oldValue) {
    if (typeof $scope.data.offer != 'number') {
      return;
    }
    $scope.showInfo = false;
    $http({
      method: 'GET',
      url: '/api/ecommerce/offering/' + $scope.data.offer + '/'
    }).
    then(function(response) {
      $scope.data.offer = response.data;
      $http({
        method: 'GET',
        url: '/api/ecommerce/listing/' + response.data.item + '/'
      }).
      then(function(response) {
        $scope.data.item = response.data;
      })
    })
  });

  $scope.requestConfirmation = function(mode) {
    $http({
      method: 'GET',
      url: '/api/ecommerce/requestConfirmation/?to=customer&mode=' + mode + '&order=' + $scope.data.id
    }).
    then(function(response) {

    });
  }

  $scope.showMap = function() {
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
          return $scope.data.offer.service;
        }
      }
    });
  }

});



app.controller('controller.ecommerce.account.orders', function($scope, $state, $http, $timeout, $uibModal, $users, Flash) {
  views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.account.orders.item.html',
  }, ];

  $scope.orderConfig = {
    views: views,
    url: '/api/ecommerce/order/',
    getParams: [{
      key: 'mode',
      value: 'consumer'
    }],
    searchField: 'id',
  }

});

app.controller('controller.ecommerce.account.settings', function($scope, $state, $http, $timeout, $uibModal, $users, Flash) {
  $scope.form = {
    address: {
      street: '',
      pincode: '',
      city: '',
      state: '',
      mobile: ''
    },
    attachment : emptyFile,
    password : '',
  }

  $http({
    method: 'GET',
    url: '/api/ecommerce/profile/'
  }).
  then(function(response) {
    // for(key in response.data[0])
    $scope.customerProfile = response.data[0];
    $scope.form.address = response.data[0].address;
    if (typeof $scope.customerProfile.attachment == 'number') {
      $http({method :'GET' , url : '/api/ecommerce/media/' + $scope.customerProfile.attachment + '/'}).
      then(function(response) {
        $scope.customerProfile.attachment = response.data;
      })
    }
  })

  $scope.uploadAttachment = function() {
    var fd = new FormData();
    fd.append( 'mediaType' , 'doc');
    fd.append( 'attachment' ,$scope.form.attachment);

    url = '/api/ecommerce/media/';

    $http({method : 'POST' , url : url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.customerProfile.attachment = response.data;
      dataToSend = {
        attachment : response.data.pk
      }
      $http({method : 'PATCH' , url : '/api/ecommerce/profile/' + $scope.customerProfile.pk + '/', data : dataToSend }).
      then(function(response) {
        Flash.create('success', response.status + ' : ' + response.statusText);
      } , function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });

  }

  $scope.me = $users.get('mySelf');

  $scope.changePassword = function() {
    dataToSend = {
      oldPassword : $scope.form.oldPassword,
      password : $scope.form.password,
    }
    $http({method : 'PATCH' , url : '/api/HR/users/' + getPK($scope.me.url) + '/' , data : dataToSend}).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    } , function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


  $scope.saveAddress = function() {
    if (emptyFile != $scope.form.attachment) {
      $scope.uploadAttachment()
    }
    if ($scope.form.password.length >0 && $scope.form.password == $scope.form.password2) {
      $scope.changePassword()
    }
    dataToSend = $scope.form.address;
    dataToSend.sendUpdates = $scope.customerProfile.sendUpdates;
    dataToSend.mobile = $scope.customerProfile.mobile;
    $http({
      method: 'PATCH',
      url: '/api/ecommerce/profile/' + $scope.customerProfile.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }

});

app.controller('controller.ecommerce.account.support', function($scope, $state, $http, $timeout, $uibModal, $users, Flash) {

  $scope.message = {
    subject: '',
    body: ''
  };
  $scope.sendMessage = function() {
    $http({
      method: 'POST',
      url: '/api/ecommerce/support/',
      data: $scope.message
    }).
    then(function(response) {
      $scope.message = {
        subject: '',
        body: ''
      };
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


});

app.controller('controller.ecommerce.account', function($scope, $state, $http, $timeout, $uibModal, $users, Flash, $window) {
  $window.scrollTo(0, 0)
});
