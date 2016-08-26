app.controller('businessManagement.virtualWorkforce.controlRoom' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){


  $scope.data = {tableData : null};


  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/app.virtualWorkforce.controlRoom.processDrag.html'},
  ];

  $scope.config = {
    views : views,
    url : '/api/virtualWorkforce/process/',
    fields : ['name' , 'description' , 'created' ],
    searchField: 'name',
    itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);
    if (action=='edit') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){




        }
      }
    }
  }

  $scope.pause = function() {
    for (var i = 0; i < $scope.jobs.length; i++) {
      if ($scope.jobs[i].selected) {
        $scope.jobs[i].status = 'paused';
      }
    }
  }

  $scope.stop = function() {
    for (var i = 0; i < $scope.jobs.length; i++) {
      if ($scope.jobs[i].selected) {
        $scope.jobs[i].status = 'stop';
      }
    }
  }

  $scope.play = function() {
    for (var i = 0; i < $scope.jobs.length; i++) {
      if ($scope.jobs[i].selected) {
        $scope.jobs[i].status = 'success';
      }
    }
  }

  $scope.onDropComplete = function(data , event , robot) {
    var toPush = {
      process : data,
      user : $scope.me.pk,
      status : 'pending',
      updated : Date(),
      robot : robot,
    }
    $scope.jobs.push(toPush)
  }

  $scope.me = $users.get('mySelf');

  $scope.jobs = [];



});
