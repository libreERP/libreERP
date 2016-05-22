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

app.controller('projectManagement.taskBoard.createTask' , function($scope ,$http, $users , Flash , $permissions, $aside){
    $scope.reset = function() {
      $scope.form = {title : '' , description :'' , dueDate : new Date() , followers : [] , files : [] , subTasks : [] , personal : true , pk : undefined , mode : 'new' , project : undefined, to : undefined}
      $scope.commentEditor = {text : ''};
      $scope.data = {pk : undefined , commitNotifications : [] , gitPage :0 , messages : [] , messagePage : 0 , addFile : false};
      $scope.explore = {mode :'git'};
      $scope.subTaskBackup = {title : '' , status : 'notStarted'};
      $scope.mode = 'new';
    }

    $scope.reset();

    $scope.projectSearch = function(query) {
      return $http.get('/api/projects/projectSearch/?title__contains=' + query).
      then(function(response){
        return response.data;
      })
    }

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
                        commit : response.data[0].pk,
                        category : 'git',
                    }
                    $http({method : 'POST' , url : '/api/taskBoard/timelineItem/' , data : dataToSend}).
                    then(function(response) {
                        $scope.data.commitNotifications.push(response.data);
                        $scope.commentEditor.text = '';
                    });
                });
            }else{
                var dataToSend = {
                    task : $scope.form.pk,
                    text : $scope.commentEditor.text,
                    category : 'message',
                }
                $http({method : 'POST' , url : '/api/taskBoard/timelineItem/' , data : dataToSend}).
                then(function(response) {
                    $scope.data.messages.push(response.data);
                    $scope.commentEditor.text = '';
                });
            }
        }
    }

    $scope.exploreNotification = function(index) {
      $aside.open({
        templateUrl : '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
        position:'left',
        size : 'xxl',
        backdrop : true,
        resolve : {
          input : function() {
            return $scope.data.commitNotifications[index].commit;
          }
        },
        controller : 'projectManagement.GIT.exploreNotification',
      })
    }

    $scope.updateFiles = function() {
        if (!$scope.explore.addFile) {
            return;
        }
        var pks = [];
        for (var i = 0; i < $scope.form.files.length; i++) {
            pks.push($scope.form.files[i].pk);
        }
        var dataToSend = {
            files : pks
        }
        $http({method : 'PATCH' , url : '/api/taskBoard/task/'+ $scope.form.pk + '/' , data : dataToSend}).
        then(function(response) {
            Flash.create('success' , 'Saved');
        });
    }

    if (typeof $scope.tab != 'undefined' && typeof $scope.tab.data.pk != 'undefined') {
      $http.get('/api/taskBoard/task/'+ $scope.tab.data.pk +'/').
      then(function(response) {
          $scope.form = response.data;
          $scope.form.to = $users.get($scope.form.to);
          $scope.form.mode = 'view';
          $http({method : 'GET' , url : '/api/taskBoard/timelineItem/?category=git&limit=5&task=' + $scope.form.pk + '&offset=' + $scope.data.gitPage }).
          then(function(response) {
              $scope.data.commitNotifications = response.data.results;
          });
          $http({method : 'GET' , url : '/api/taskBoard/timelineItem/?category=message&limit=5&task=' + $scope.form.pk + '&offset=' + $scope.data.messagePage }).
          then(function(response) {
              $scope.data.messages = response.data.results;
          });
          $scope.mode = 'view';
      });
    }

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

    $scope.closeEditor = function(index){
        var st = $scope.form.subTasks[index];
        if (typeof st.pk == 'undefined') {
            $scope.form.subTasks.splice(index,1);
        }else{
            $scope.form.subTasks[index] = $scope.subTaskBackup;
            $scope.form.subTasks[index].inEditor = false;
        }
    }

    $scope.editSubTask = function(index) {
        $scope.subTaskBackup = angular.copy($scope.form.subTasks[index]);
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
        }
        if (typeof $scope.form.to != 'undefined') {
          dataToSend.to = $scope.form.to.pk;
        }
        if (typeof $scope.form.project != 'undefined' && $scope.form.project != null) {
          dataToSend.project = $scope.form.project.pk;
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
            $scope.form.pk = response.data.pk;
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
        var url ='/api/taskBoard/subTask/';
        if ($scope.form.pk == null || typeof $scope.form.pk == 'undefined') {
            Flash.create('warning' , 'Please save the parent Task before before this can be saved');
            return;
        }
        var st = $scope.form.subTasks[index]
        if (typeof st.pk!='undefined' && st.title.length == 0) {
            $http({method : 'DELETE', url : url + st.pk + '/' }).
            then((function(index) {
                return function(response) {
                    $scope.form.subTasks.splice(index , 1);
                    Flash.create('success' , 'Sub Task deleted');
                }
            })(index))
            return;
        }
        if (st.title.length == 0) {
            Flash.create('warning' , 'Title can not be left blank');
            return;
        }
        var dataToSend = {
            title : st.title,
        }
        var method = 'POST';
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

app.controller('projectManagement.taskBoard.task.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.getPercentageComplete = function() {
    var percentage = 0;
    for (var i = 0; i < $scope.data.subTasks.length; i++) {
      if($scope.data.subTasks[i].status == 'complete'){
        percentage += 100;
      }else if ($scope.data.subTasks[i].status == 'inProgress') {
        percentage += 50;
      }else if ($scope.data.subTasks[i].status == 'stuck') {
        percentage += 25;
      }
    }
    if ($scope.data.subTasks.length >0) {
      return Math.floor(percentage/$scope.data.subTasks.length);
    }else {
      return 100;
    }
  }

  $scope.getStatusColor = function() {
    var percentage = $scope.getPercentageComplete();
    if (percentage<=20) {
      return 'bg-red';
    }else if (percentage>20 && percentage <50) {
      return 'bg-yellow';
    }else if (percentage >=50 && percentage<75) {
      return 'bg-aqua';
    }else{
      return 'bg-green';
    }
  }

});

app.controller('projectManagement.taskBoard.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.data = {tableData : []};

  $scope.me = $users.get('mySelf');
  $http({method : 'GET' , url : '/api/taskBoard/task/?user=' + $scope.me.pk}).
  then(function(response) {
    $scope.tasks = response.data;
  });



  $scope.createTask = function() {
      $aside.open({
          templateUrl : '/static/ngTemplates/app.taskBoard.createTask.html',
          controller : 'projectManagement.taskBoard.createTask',
          position:'left',
          size : 'xl',
          backdrop : true,
      })
  }

  var views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.taskBoard.item.html',
  }, ];

  $scope.tasksConfig = {
    views: views,
    url: '/api/taskBoard/task/',
    searchField: 'title',
    getParams : [{key : 'to' , value : $scope.me.pk},],
    multiselectOptions : [{icon : 'fa fa-plus' , text : 'Add' },],
    filters : [
      {icon : 'fa fa-file' , key : 'newFilter' , btnClass:'default' , orderable : true, options : [
        {icon : '' , value : 'following'},
        {icon : '' , value : 'following2'},
        {icon : '' , value : 'following3'},
      ]},
      {icon : 'fa fa-file' , key : 'newFilter2' , btnClass:'default' , orderable : false, options : [
        {icon : '' , value : 'following'},
        {icon : '' , value : 'following4'},
        {icon : '' , value : 'following5'},
      ]},
    ],
    drills : [
      {icon : 'fa fa-bars' , name : 'someCombo' , btnClass : 'primary' , options : [
        {key : 'drill1', value : true},
        {key : 'drill2', value : false},
        {key : 'drill3', value : true},
      ]},
      {icon : 'fa fa-plus' , name : 'someCombo2' , btnClass : 'default' , options : [
        {key : 'drill4', value : true},
        {key : 'drill5', value : false},
        {key : 'drill6', value : true},
      ]}
    ]
  }

  $scope.tableAction = function(target , action , mode){
    console.log(target);
    if (mode == 'multi') {
      $scope.createTask();
    }else{
      if (action == 'taskBrowser') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == parseInt(target)){
            $scope.addTab({title : 'Browse task : ' + $scope.data.tableData[i].title , cancel : true , app : 'taskBrowser' , data : {pk : target , name : $scope.data.tableData[i].title} , active : true})
          }
        }
      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
      console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});
