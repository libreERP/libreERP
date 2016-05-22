app.controller('projectManagement.projects.new' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
    $scope.postProject = function() {
        var dataToSend = $scope.form;
        dataToSend.files = []
        for (var i = 0; i < $scope.data.files.length; i++) {
            dataToSend.files.push($scope.data.files[i].pk)
        }
        $http({method : 'POST' , url : '/api/projects/project/' , data : dataToSend}).
        then(function(response) {
            Flash.create('success' , 'Project created')
            $scope.data.files = [];
            $scope.form = {title : '' , dueDate : new Date() , description : '' , files : [], team : []};
        });
    };
    $scope.reset = function() {
      $scope.form = {title : '' , dueDate : new Date() , description : '' , team : []};
      $scope.data = {files : []};
    };
    $scope.reset();
});
