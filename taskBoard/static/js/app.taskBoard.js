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

    $scope.form = {title : '' , description :'' , dueDate : new Date() , followers : [] , files : [] , subTasks : [] , personal : true , pk : null , mode : 'new'}

    $scope.commentEditor = {text : 'C#e52d734522e3'};

    $scope.addTimelineItem = function() {
        if ($scope.commentEditor.text.length ==0) {
            Flash.create('warning' , 'Nothing to add!');
            return;
        }else {
            if ($scope.commentEditor.text.startsWith('C#')) {
                // its a commit to be added
                var sha = $scope.commentEditor.text.split('C#')[1];
                if (sha.length == 0) {
                    Flash.create('warning' , 'Plaase provide the HASH value of the commit');
                    return;
                }
                $http({method : 'GET' , url : '/api/git/commitNotification/?sha__contains=' + sha }).
                then(function(response) {
                    if (response.data.count >1) {
                        Flash.create('warning' , 'More then one commit found for this commit HASH');
                        return;
                    }
                    var dataToSend = {
                        task : $scope.form.pk,
                        commit : response.data.result[0].pk,
                    }
                    $http({method : 'POST' , url : '/api/taskBoard/'})
                });
            }else{
                var dataToSend = {
                    task : $scope.form.pk,
                    commit : response.data.result[0].pk,
                }
            }
        }
    }

    $http.get('/api/taskBoard/task/6/').
    then(function(response) {
        $scope.form = response.data;
        $scope.form.to = $users.get($scope.form.to);
        $scope.form.mode = 'view';
    });

    $scope.explore = {mode :'git'};
    $scope.changeExploreMode = function(mode) {
        $scope.explore.mode = mode;
    }

    $scope.edit = function() {
        $scope.form.mode = 'edit';
    }

    $scope.addSubTask = function(){
        for (var i = 0; i < $scope.form.subTasks.length; i++) {
            if($scope.form.subTasks[i].inEditor){
                return;
            }
        }
        $scope.form.subTasks.push({title : '' , status : 'notStarted', inEditor : true});
    }

    $scope.subTaskBackup = {title : '' , status : 'notStarted'};

    $scope.closeEditor = function(index){
        var st = $scope.form.subTasks[index];
        if (st.title.length ==0 && typeof st.pk == 'undefined') {
            $scope.form.subTasks.splice(index,1);
        }else{
            $scope.form.subTasks.title = $scope.subTaskBackup.title;
            $scope.form.subTasks.status = $scope.subTaskBackup.status;
        }
    }

    $scope.editSubTask = function(index) {
        $scope.form.subTasks[index].inEditor = true;
    }

    $scope.save = function() {
        var method = 'POST';
        var url = '/api/taskBoard/task/';
        var dataToSend = {
            title : $scope.form.title,
            description : $scope.form.description,
            dueDate : $scope.form.dueDate,
            followers : $scope.form.followers,
            to : $scope.form.to.pk,
        }

        dataToSend.files = []
        for (var i = 0; i < $scope.form.files.length; i++) {
            dataToSend.files.push($scope.form.files[i].pk);
        }

        if ($scope.form.pk == null || typeof $scope.form.pk == 'undefined' ) {
            dataToSend.personal = $scope.form.personal;
        }else {
            method = 'PATCH';
            url += $scope.form.pk + '/';
        }
        $http({method : method , url : url , data : dataToSend}).
        then(function(response) {
            Flash.create('success' , 'Saved');
            $scope.form.mode = 'view';
            // $scope.form = response.data;
        })
    }

    $scope.changeSubTaskStatus = function(status , index) {
        $scope.form.subTasks[index].status = status;
        var st = $scope.form.subTasks[index];
        $http({method : 'PATCH' , url : '/api/taskBoard/subTask/' + st.pk + '/' , data : st }).
        then(function(response) {
            Flash.create('success' , 'Updated');
        });
    }

    $scope.saveSubTask = function(index) {
        if ($scope.form.pk == null || typeof $scope.form.pk == 'undefined') {
            Flash.create('warning' , 'Please save the parent Task before before this can be saved');
            return;
        }
        var st = $scope.form.subTasks[index]
        if (st.title.length == 0) {
            Flash.create('warning' , 'Title can not be left blank');
            return;
        }
        var dataToSend = {
            title : st.title,
        }
        var method = 'POST';
        var url ='/api/taskBoard/subTask/';
        if (typeof st.pk == 'undefined') {
            // its a new task
            dataToSend.status = 'notStarted';
            dataToSend.task = $scope.form.pk;
        }else {
            dataToSend.status = st.status;
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
