app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement.taskBoard', {
    url: "/taskBoard",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.taskBoard.html',
       },
       "menu@projectManagement.taskBoard": {
          templateUrl: '/static/ngTemplates/app.taskBoard.menu.html',
          controller : 'projectManagement.taskBoard.menu',
        },
        "@projectManagement.taskBoard": {
          templateUrl: '/static/ngTemplates/app.taskBoard.default.html',
          controller : 'projectManagement.taskBoard.default',
        }
    }
  })


});

app.controller('projectManagement.taskBoard.createTask' , function($scope ,$http, $users , Flash , $permissions){

    $scope.form = {title : '' , description :'' , dueDate : new Date() , followers : [] , files : [] , subTasks : [] , personal : true , pk : null}

    $scope.addSubTask = function() {
        $scope.form.subTasks.push({title : '' , status : 'notStarted', inEditor : true});
    }

    $scope.saveSubTask = function(index) {
        if ($scope.form.pk == null || typeof $scope.form.pk == 'undefined') {
            Flash.create('success' , 'Please save the parent Task before before this can be saved');
            return;
        }
        var st = $scope.form.subTasks[index]
        var dataToSend = {
            title : st.title,
            status : 'notStarted',
        }
        var method = 'POST';
        var url ='/api/taskBoard/';
        if (st.pk != null && typeof st.pk == 'undefined') {
            // its a new task
            dataToSend.task = $scope.form.pk;
        }else {
            method = 'PATCH';
            url += st.pk + '/'
        }
        $http({method : method , url : url , data : dataToSend}).
        then((function(index) {
            return function(response) {
                $scope.form.subTasks[index] = response.data;
            }
        })(index))
    };

});


app.controller('projectManagement.taskBoard.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

    $scope.createTask = function() {
        $aside.open({
            templateUrl : '/static/ngTemplates/app.taskBoard.createTask.html',
            controller : 'projectManagement.taskBoard.createTask',
            position:'left',
            size : 'xl',
            backdrop : true,
        })
    }

    $scope.createTask();

});
