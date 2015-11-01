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

app.directive('genericForm', function () {
  return {
    templateUrl: '/genericForm.html',
    restrict: 'E',
    replace: true,
    scope: {
      template : '=',
      submitFn : '&',
      data :'=',
      formTitle : '=',
      wizard : '=',
      maxPage : '=',
    },
    controller : function($scope , $state){
      $scope.page = 1;
      $scope.next = function(){
        $scope.page +=1;
        if ($scope.page>$scope.maxPage) {
          $scope.page = $scope.maxPage;
        }
      }
      $scope.prev = function(){
        $scope.page -=1;
        if ($scope.page<1) {
          $scope.page = 1;
        }
      }
    },
  };
});

app.controller('admin' , function($scope , userProfileService){
  // console.log(userProfileService.get('mySelf'));
});

app.controller('admin.manageUsers' , function($scope , $http , $aside){
  emptyFile = new File([""], "");
  // $scope.profile = {'empID' : '', 'dateOfBirth' : '' , 'anivarsary' : '' , 'permanentAddressStreet' : '', 'permanentAddressCity' : '', 'permanentAddressPin' : '', 'permanentAddressState' : '', 'permanentAddressCountry' : '',
  //     'localAddressStreet' : '', 'localAddressCity' : '', 'localAddressPin' : '', 'localAddressState' : '', 'localAddressCountry' : '', 'prefix' : '', 'gender' :'', 'email' : '', 'email2' : '', 'mobile' : '', 'emergency' : '',
  //     'tele': '' , 'website': '' ,'sign' :emptyFile, 'IDPhoto' :emptyFile, 'TNCandBond' :emptyFile , 'resume' :emptyFile,  'certificates' :emptyFile, 'transcripts' :emptyFile, 'otherDocs' :emptyFile, 'almaMater' : '', 'pgUniversity' : '', 'docUniversity' : '', 'fathersName' : '',
  //     'mothersName' : '', 'wifesName' : '', 'childCSV': '','note1' : '' , 'note2' : '', 'note3': '' };

  $scope.profileEditorUser = '/api/HR/userProfileAdminMode/1';
  $scope.editProfile = function(){
    console.log("Going to submit the profile data");
    console.log($scope.profile);
    var fd = new FormData();
    for(key in $scope.profile){
      if (key!='url' ) {
        console.log('For the key '  + key + ' the value is ' + $scope.profile[key]);
        if ($scope.profileFormStructure[key].type.indexOf('integer')!=-1 ) {
          if ($scope.profile[key]!= null) {
            fd.append( key , parseInt($scope.profile[key]));
          }
        }else if ($scope.profileFormStructure[key].type.indexOf('date')!=-1 ) {
          if ($scope.profile[key]!= null) {
            fd.append( key , $scope.profile[key]);
          }
        }else{
          fd.append( key , $scope.profile[key]);
        }
      }
    }
    $http({method : 'PATCH' , url : $scope.profileUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.statusMessage = "Posted";
      $scope.httpStatus = 'success';
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.httpStatus = '';
        $scope.$apply();
      }, 4000);
    },function(response){
      $scope.httpStatus = 'danger';
      $scope.statusMessage = response.status + ' : ' + response.statusText;
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.httpStatus = '';
        $scope.$apply();
      }, 4000);
    });
  }

  $http({method :'OPTIONS' , url : '/api/HR/userProfileAdminMode'}).
  then(function(response){
    $scope.formData = response.data.actions.POST;
    console.log(response.data.actions.POST);
  } , function(response){
    console.log(response);
  });

  $http({method :'GET' , url : $scope.profileEditorUser}).
  then(function(response){
    $scope.profile = response.data;
    console.log($scope.profile);
    $http({method :'OPTIONS' , url : '/api/HR/userProfileAdminMode'}).
    then(function(response){
      $scope.profileFormStructure = response.data.actions.POST;
      for(key in $scope.profileFormStructure){
        if ($scope.profileFormStructure[key].type.indexOf('upload') !=-1) {
          $scope.profile[key] = emptyFile;
        }
      }
      console.log($scope.profile);
      $scope.profileUrl = $scope.profile.url.replace('userProfile' , 'userProfileAdminMode')
    } , function(response){
      console.log(response);
    });
  } , function(response){
    console.log(response);
  });

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
