var app = angular.module('app' , ['flash',]);

app.config(function( $httpProvider , $provide){

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.controller('main' , function($scope , $http ,Flash){

  $scope.resetForm = function(){

    $scope.form = {
      signup : {first_name : '', last_name :'' , email : '' , password : ''},
      serviceForm1 : {name : '' , cin : '' , tin : '' , mobile : '' , telephone : '' },
      serviceForm2 : {street : '' , pincode : '' , city :'' , state :'' , about : ''},
    }
  }
  $scope.resetForm()
  $scope.stage = 'signupForm'
  $scope.submit = function(){
    dataToSend = {};
    for(key in $scope.form.signup){
      dataToSend[key] = $scope.form.signup[key];
    }
    for(key in $scope.form.serviceForm1){
      dataToSend[key] = $scope.form.serviceForm1[key];
    }
    for(key in $scope.form.serviceForm2){
      dataToSend[key] = $scope.form.serviceForm2[key];
    }
    $http({method: 'POST' , url : '/api/ecommerce/providerRegistration/' , data : dataToSend}).
    then(function(response){
      $scope.stage = 'confirm';
      $scope.resetForm();
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }
  $scope.continue = function(){
    if ($scope.stage == 'signupForm') {
      if (!isEmail($scope.form.signup.email)) {
        Flash.create('danger' , 'e-mail address is not valid')
        return;
      }
      $scope.stage = 'serviceForm1';
    } else if ($scope.stage == 'serviceForm1') {
      $scope.stage = 'serviceForm2'
    } else if ($scope.stage == 'serviceForm2') {
      console.log("complete");
    }
  }

  $scope.goBack = function(){
    if ($scope.stage == 'serviceForm1') {
      $scope.stage = 'signupForm';
    } else if ($scope.stage == 'serviceForm2') {
      $scope.stage = 'serviceForm1';
    } else if ($scope.stage == 'confirm') {
      $scope.stage = 'signupForm';
    }
  }

});

function isEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
