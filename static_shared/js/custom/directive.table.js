app.directive('genericTable' , function(){
  return {
    templateUrl: '/static/ngTemplates/genericTable/genericSearch.html',
    restrict: 'E',
    transclude: true,
    replace: false,
    scope: {
      data :'=',
      configObj : '@',
      callbackFn : '=',
    },
    controller : 'genericTable',
  };
});

app.controller('genericTable' , function($scope , $http, $templateCache, $timeout , $users , Flash , $uibModal) {

  $scope.config = JSON.parse($scope.configObj);

  $scope.data = [];
  $scope.searchText = '';
  $scope.originalTable = [];

  $scope.pageList = [1];
  $scope.pageNo = 1; // default page number set to 0
  $scope.viewMode = 'list';
  $scope.numOfPagesPerView = 5;
  $scope.viewMode = 0;

  $scope.options = $scope.config.options;
  $scope.isSelectable = angular.isDefined($scope.config.multiselectOptions) ? true:false;
  $scope.itemsNumPerView = angular.isDefined($scope.config.itemsNumPerView) ? $scope.config.itemsNumPerView:[5, 10, 20];
  $scope.itemsPerView = $scope.itemsNumPerView[0];
  $scope.deletable = angular.isDefined($scope.config.deletable) ? $scope.config.deletable:false;
  $scope.editorTemplate = angular.isDefined($scope.config.editorTemplate) ? $scope.config.editorTemplate:'';

  $scope.haveOptions = angular.isDefined($scope.config.options) ? true:false;
  $scope.canCreate = angular.isDefined($scope.config.canCreate) ? $scope.config.canCreate:false;
  $scope.url = $scope.config.url;
  $scope.searchField = angular.isDefined($scope.config.searchField) ? $scope.config.searchField:'';
  $scope.fields = angular.isDefined($scope.config.fields) ? $scope.config.fields: false;
  $scope.searchShow = $scope.searchField==''? false:true,

  $scope.views = $scope.config.views;
  $scope.multiselectOptions = $scope.config.multiselectOptions;
  $scope.drills = angular.isDefined($scope.config.drills) ? $scope.config.drills : [];
  $scope.filters = angular.isDefined($scope.config.filters) ? $scope.config.filters : [];
  for (var i = 0; i < $scope.filters.length; i++) {
    $scope.filters[i].active = 0;
    $scope.filters[i].ascend = true; // true for ascending and false for descenting
  };

  $scope.getParams = $scope.config.getParams;

  $scope.$watch('data' , function(newValue , oldValue){
    $scope.selectStates = [];
    if ($scope.isSelectable) {
      for (var i = 0; i < $scope.data.length; i++) {
        $scope.selectStates.push({value : false , disabled : false});
      }
    }
  });

  $scope.$on('forceInsetdata', function(event, input) {
    // console.log($scope.data);
    $scope.data.push(input);
  });

  $scope.create = function(){
    // the template is in $scope.itemTemplate
    $scope.createModalInstance = $uibModal.open({
      templateUrl: $scope.editorTemplate,
      size: 'lg',
      scope:$scope, //Refer to parent scope here
      resolve: {
       submitFormFn : function(){
         return $scope.callbackFn; // pass data directly from the template to the callbackFn
       }
      },
      controller: function($scope , submitFormFn ){
        $scope.submitForm = submitFormFn;
        $scope.mode = 'new';
        $scope.data = {};
        $scope.$on('forceSetFormData', function(event, input) {
          for (key in input) {
            $scope.data[key] = input[key];
          }
        });

      },
    });
  }

  $scope.delete = function(pk , index){
    if (pk == -1) {
      $scope.data.splice(index, 1);
      return;
    }
    $http({method : 'DELETE' , url : $scope.url + pk + '/' }).
    then(function(response){
      $scope.data.splice(index, 1);
      if ($scope.data.length ==0) {
        $scope.changePage($scope.pageNo-1);
      }
      Flash.create('success', response.status + ' : ' + response.statusText );
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    })
  }

  $scope.changeView = function(mode){
    $scope.viewMode = mode;
  }
  $scope.multiSelectAction = function(action){
    items = [];
    for (var i = 0; i < $scope.selectStates.length; i++) {
      if ($scope.selectStates[i].value == true) {
        if (typeof $scope.data[i].url == 'undefined') {
          items.push($scope.data[i].pk);
        } else{
          items.push($scope.data[i].url);
        }
      }
    }
    $scope.callbackFn(items , action , 'multi')
  };

  $scope.fullTextSearch = function(str){
    var rowsContaining = [];
    var str = str.toLowerCase();
    // console.log(str);
    for (var i = 0; i < $scope.originalTable.length; i++) {

      var row = $scope.originalTable[i];
      for (key in row){
        if (row[key] == null) {
          continue;
        }
        var val = row[key].toString().toLowerCase();
        if ( val.indexOf(str) !=-1){
          rowsContaining.push(i)
          break;
        };
        var rowNested = row[key];
        if (typeof rowNested == 'object') {
          for (keyNested in rowNested){
            if (rowNested[keyNested] != null) {
              var valNested = rowNested[keyNested].toString().toLowerCase();
              if (valNested.indexOf(str) !=-1){
                if (rowsContaining.indexOf(i) == -1) {
                  rowsContaining.push(i)
                  break;
                }
              };
            }
          };
        }
      };
    } // main for loop

    $scope.data = [];
    for (var i = 0; i < rowsContaining.length; i++) {
      $scope.data.push($scope.originalTable[rowsContaining[i]]);
    }
  }

  $scope.$on('forceRefetch' , function(evt , input) {
    $scope.fetchData();
  });

  $scope.fetchData = function(){
    console.log("came");
    var fetch = {method : '' , url : ''};
    // getting the data from the server based on the state of the filter params
    if (typeof $scope.getStr == 'undefined' && $scope.searchField!='') {
      return;
    }
    fetch.method = 'GET';
    if (typeof $scope.searchField == 'undefined' || $scope.searchField =='') {
      fetch.url = $scope.url +'?&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
    } else {
      fetch.url = $scope.url +'?&'+ $scope.searchField +'__contains=' + $scope.getStr + '&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
    }
    if (typeof $scope.getParams != 'undefined') {
      for (var i = 0; i < $scope.getParams.length; i++) {
        fetch.url += '&'+$scope.getParams[i].key + '='+ $scope.getParams[i].value;
      }
    }
    var paramToSend = {};
    for (var i = 0; i < $scope.drills.length; i++) {
      for (var j = 0; j < $scope.drills[i].options.length; j++) {
        var o = $scope.drills[i].options[j];
        paramToSend[o.key] = o.value ? 1 : 0;
      };
    };

    for (var i = 0; i < $scope.filters.length; i++) {
      var f = $scope.filters[i];
      paramToSend[f.key] = f.options[f.active].value + ':'+ f.ascend ;
    };

    $http({method: fetch.method, url: fetch.url , params : paramToSend }).
      then(function(response) {
        // console.log(response);
        $scope.pageCount = Math.floor(response.data.count/$scope.itemsPerView)+(response.data.count%$scope.itemsPerView == 0 ? 0 : 1);
        if ($scope.pageCount<$scope.pageList[0]) {
          $scope.pageList = [1];
        } else {
          $scope.pageList = [$scope.pageList[0]];
        }
        for (var i = $scope.pageList[0]+1; i <= $scope.pageCount; i++) {
          if ($scope.pageList.length<$scope.numOfPagesPerView) {
            $scope.pageList.push(i);
          }
        }
        // console.log($scope.pageList);

        $scope.data = response.data.results;
        $scope.originalTable = angular.copy($scope.data);
        $scope.sortFlag = [];
        $scope.tableHeading = [];
        for (key in $scope.data[0]){
          $scope.tableHeading.push(key);
          $scope.sortFlag.push(0);  // by default no sort is applied , 1 for accending and -1 for descending
        }
        if ($scope.isSelectable) {
          $scope.tableHeading.unshift('Select');
          $scope.sortFlag.unshift(-2); // no sort can be applied on this column
        }

        if ($scope.haveOptions || $scope.editable || $scope.deletable) {
          $scope.tableHeading.push('Options')
          $scope.sortFlag.push(-2); // no sort possible
        }
      }, function(response) {

    });
    // $scope.pageNo = 1;
  }

  $scope.$watch('getStr' , function(){ // getStr is the search query sent to the server
    $scope.fetchData();
  });

  // $scope.$watch('searchText',function(newValue , oldValue){
  //   $scope.changePage(1)
  //   $scope.updateData()
  // });

  $scope.searchDb = function() {
      $scope.changePage(1)
      $scope.updateData()
  }

  $scope.updateData = function(){ // at any point of time forcing to refresh data
    var parts = $scope.searchText.split('>');
    if (typeof $scope.searchField == 'undefined' || $scope.searchField == '') {
      var searchStr = $scope.searchText;
    } else {
      $scope.getStr = parts[0].trim();
      if (typeof parts[1] == 'undefined'){
        searchStr = '';
      }else{
        searchStr = parts[1].trim();
      };
    }
    // console.log(searchStr);
    $scope.fullTextSearch(searchStr);
  }

  $scope.changePage = function(toPage){
    // change page number ot the seleted page
    $scope.pageNo = toPage;
    $scope.fetchData();
    // console.log("will change the page now" + toPage);

  }
  $scope.loadPrevSetPages = function(){
    // function to load prev set of pages
    var currentlyFirst = $scope.pageList[0];
    if (currentlyFirst!=1) {
      $scope.pageList = [currentlyFirst - $scope.numOfPagesPerView];
      // console.log(pageCount);
      for (var i = $scope.pageList[0]+1; i <= $scope.pageCount; i++) {
        if ($scope.pageList.length<$scope.numOfPagesPerView) {
          $scope.pageList.push(i);
        }
      }
    }
  }
  $scope.loadNextSetPages = function(){
    // function to load the next set of pages
    // console.log($scope.pageList[$scope.pageList.length -1]);
    var currentlyLast = $scope.pageList[$scope.pageList.length -1];
    if (currentlyLast!=$scope.pageCount) {
      $scope.pageList = [currentlyLast+1];
      // console.log(pageCount);
      for (var i = $scope.pageList[0]+1; i <= $scope.pageCount; i++) {
        if ($scope.pageList.length<$scope.numOfPagesPerView) {
          $scope.pageList.push(i);
        }
      }
    }
  }
  $scope.changeNumView = function(num){
    $scope.itemsPerView = num;
    $scope.updateData();
    $scope.changePage(1);
    // console.log($scope.pageNo);
  }
  $scope.sort = function(col){
    $scope.tableSnap = angular.copy($scope.data);
    if ($scope.sortFlag[col]==-2) {
      console.log("No sort possible");
      return;
    }

    // console.log("will sort according to col " + col);
    var colData = [];
    var len =$scope.data.length;
    var indices = new Array(len);
    for (var i = 0; i < len; i++) {
      colData.push($scope.data[i][$scope.tableHeading[col]]);
      indices[i] = i;
    }
    if ($scope.sortFlag[col]==0 || $scope.sortFlag[col]==-1) {
      indices.sort(function (a, b) { return colData[a] < colData[b] ? -1 : colData[a] > colData[b] ? 1 : 0; });
      $scope.sortFlag[col] = 1;

    }else{
      indices.sort(function (a, b) { return colData[a] > colData[b] ? -1 : colData[a] < colData[b] ? 1 : 0; });
      $scope.sortFlag[col] = -1;
    }

    for (var i = 0; i < $scope.sortFlag.length; i++) {
      if (i !=col && $scope.sortFlag[i] !==-2) {
        $scope.sortFlag[i] = 0;
      }
    }
    // console.log(indices)
    // console.log($scope.sortFlag);
    for(var i =0 ; i < len ; i++){
      $scope.data[i] = angular.copy($scope.tableSnap[indices[i]])
    }
  };

  $scope.updateData();

});

app.directive('tableRow', function () {
  return {
    templateUrl:  '/static/ngTemplates/genericTable/tableRow.html',
    restrict: 'A',
    transclude: true,
    replace: true,
    scope:{
      // fields that can be passed as string
      configObj : '@',

      data : '=', // individual row data
      rowAction : '=', // originally the callbackFn function
      checkbox : '=', // boolean flag for the value of the checkbox binded to the table
      // directive scope where it will collect the state of the checkboxes and passed to
      // the main controller upon selecting the multi select option
      index : '=', // the index of the item in the repeat
      delete :'=', // delete callback function
    },
    controller : 'genericTableItem',
  };
});

app.directive('tableItem', function () {
  return {
    template:  '<div ng-include="template"> </div>',
    restrict: 'EA',
    transclude: false,
    replace: true,
    scope:{
      configObj : '@',

      template : '@',
      data : '=',
      rowAction : '=',
      checkbox : '=',
      index: '=',
      delete: '=',
    },
    controller : 'genericTableItem',
  };
});

app.controller('genericTableItem' , function($scope , $uibModal){
  // console.log($scope);
  $scope.config = JSON.parse($scope.configObj);
  $scope.options = $scope.config.options;
  $scope.selectable = angular.isDefined($scope.config.multiselectOptions) ? true:false;
  $scope.deletable = angular.isDefined($scope.config.deletable) ? $scope.config.deletable:false;
  $scope.editorTemplate = angular.isDefined($scope.config.editorTemplate) ? $scope.config.editorTemplate:'';
  $scope.fields = angular.isDefined($scope.config.fields) ? $scope.config.fields: false;

  $scope.getTarget = function(){
    if (typeof $scope.data.url == 'undefined') {
      if (typeof $scope.data.pk == 'undefined') {
        $scope.target = $scope.data.id;
      } else {
        $scope.target = $scope.data.pk;
      }
    } else {
      $scope.target = $scope.data.url;
      $scope.data.pk = getPK($scope.data.url);
    }
  }

  $scope.getTarget()

  $scope.rowActionClicked = function(option){
    $scope.getTarget();
    $scope.rowAction( $scope.target ,  option)
  }

  if (angular.isDefined($scope.rowScope)) {
    $scope.rowScope = angular.copy($scope.rowScope) // i noticed that it was binding this to the root rowScope outside the table directive
    // basically when we want to edit the data and pass some functions or variables from outside of the generic table directive down to the modal controller
  }

  $scope.submitForm = function(){
    $scope.rowAction( $scope.target , 'submitForm' , $scope.data);
    // $scope.target is the pk or the url of the object
  }

  $scope.editable = angular.isDefined($scope.editorTemplate) && $scope.editorTemplate.length!=0? true : false;
  // the parent scope on successful posting the data sends this signal with a input
  $scope.$on('forceGenericTableRowRefresh', function(event, input) {
    if ($scope.pk == input.pk || input.pk == -1) { // -1 when we want all of them to update certain property but i dont think there is a use case for this
      for (key in input){
        $scope.data[key] = input[key];
      }
    }
  });

  // anything passed in the rowScope variable in the generic-table directive is available (without binding) to the modal's controller (in the $scope variable)
  // as well as the table row scope (in $scope.rowScope variable)
  $scope.edit = function(){
    $uibModal.open({
      templateUrl: $scope.editorTemplate,
      size: 'lg',
      resolve: {
       submitFormFn : function(){
         return $scope.submitForm;
       },
       data : function(){
         return $scope.data;
       },
       config : function(){
         return $scope.config;
       },
      },
      controller: function($scope , submitFormFn , data , config){
        $scope.submitForm = submitFormFn;
        $scope.data = data;
        $scope.data.formData = [];
        $scope.mode = 'edit';
        $scope.config = config;
      },
    });
  }


  if (angular.isDefined($scope.options )) {
    $scope.optionsShow = true;
    $scope.otherOptions = angular.isDefined($scope.options.others)// show apart from main functions
  }else{
    $scope.optionsShow = false;
  }
});
