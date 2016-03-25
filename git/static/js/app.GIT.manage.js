app.controller('projectManagement.GIT.manage' , function($scope ,$http, $users , Flash , $permissions){

  $scope.syncGitolite = function() {
    $http({method : 'GET' , url : '/api/git/syncGitolite/'}).
    then(function(response) {
      Flash.create('success' , response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  }


});
