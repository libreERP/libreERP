app.controller('projectManagement.GIT.manage' , function($scope ,$http, $users , Flash , $permissions){

  $scope.syncGitolite = function() {
    $http({method : 'GET' , url : '/api/git/syncGitolite/'}).
    then(function(response) {
      Flash.create('success' , response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  }

  views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/genericSearchList.html', itemTemplate : '/static/ngTemplates/app.GIT.profile.item.html',},
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  var multiselectOptions = [{icon : 'fa fa-refresh' , text : 'syncGitolite' },
  ];
  $scope.config = {
    views : views,
    url : '/api/git/profile/',
    // fields : ['pk','title' , 'description' , 'priceModel' , 'approved' , 'category' , 'parentType'],
    searchField: 'name',
    multiselectOptions : multiselectOptions,
    // deletable : true,
    itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    if (mode == 'multi') {
      if (action == 'syncGitolite') {
        $scope.syncGitolite();
      }
    }else {
      if (action=='edit') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == parseInt(target)){
            $scope.addTab({title : 'Edit Listing : ' + $scope.data.tableData[i].title , cancel : true , app : 'editListing' , data : {pk : target} , active : true})
          }
        }
      }
    }
  }


});
