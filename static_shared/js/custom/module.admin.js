app.config(function($stateProvider){

  $stateProvider
  .state('admin', {
    url: "/admin",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/admin.html',
          controller: 'admin'
       },
       "menu@admin": {
          templateUrl: '/static/ngTemplates/adminMenu.html',
        }
    }
  })

  .state('admin.search', {
    url: "/search",
    template: '<div> Loren Ipsum Text</div>',
    controller: 'admin.search'
  })

  .state('admin.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/admin.manageUsers.html',
    controller: 'admin.manageUsers'
  })

});

app.controller('admin' , function($scope , userProfileService){
  // console.log(userProfileService.get('mySelf'));
});

app.controller('admin.manageUsers' , function($scope , $http , $aside){
  $scope.statusMessage = '';
  $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
  $scope.createUser = function(){
    console.log("going to create a new User");
    dataToSend = {username : $scope.newUser.username , first_name : $scope.newUser.firstName , last_name : $scope.newUser.lastName , password : $scope.newUser.password};
    $http({method : 'POST' , url : '/api/HR/users/', data : dataToSend }).
    then(function(response){
      $scope.httpStatus = 'success';
      $scope.statusMessage = response.status + ' : ' + response.statusText;
      $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.httpStatus = '';
        $scope.$apply();
      }, 2000);
    } , function(response){
      $scope.statusMessage = response.status + ' : ' + response.statusText;
      $scope.httpStatus = 'danger';
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.httpStatus = '';
        $scope.$apply();
      }, 2000);
    });
  }

  $scope.openAside = function(position, backdrop) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $aside.open({
      templateUrl: '/static/ngTemplates/admin.manageUsers.html',
      placement: position,
      size: 'lg',
      backdrop: backdrop,
      controller: function($scope, $modalInstance) {
        $scope.ok = function(e) {
          $modalInstance.close();
          e.stopPropagation();
        };
        $scope.cancel = function(e) {
          $modalInstance.dismiss();
          e.stopPropagation();
        };
      }
    }).result.then(postClose, postClose);
  }


});
app.controller('admin.search' , function($scope ){

});
