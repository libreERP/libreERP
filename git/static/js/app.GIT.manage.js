app.controller('projectManagement.GIT.manage' , function($scope ,$http, $users , Flash , $permissions){

  $scope.syncGitolite = function() {
    $http({method : 'GET' , url : '/api/git/syncGitolite/'}).
    then(function(response) {
      console.log(response.data);
    });
  }


});
