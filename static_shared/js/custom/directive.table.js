app.directive('genericTable', function () {
  return {
    templateUrl: '/static/ngTemplates/genericTable/genericSearch.html',
    restrict: 'E',
    transclude: true,
    replace: false,
    scope: {
      tableData :'=',
      resourceUrl : '@',
      primarySearchField : '@',
      callbackFn : '=',
      views : '=',
      options : '=',
      multiselectOptions : '=',
      search : '@',
      getParams :'=',
      rowScope : '=',
      canCreate : '@',
      editorTemplate : '@',
    },
    controller : 'genericTable',
  };
});

app.controller('genericTable' , function($scope , $http, $templateCache, $timeout , $users , $aside , Flash , $uibModal) {
  $scope.tableData = [];
  $scope.searchText = '';
  $scope.originalTable = [];
  $scope.itemsNumPerView = [5, 10, 20];
  $scope.itemsPerView = 5;
  $scope.pageList = [1];
  $scope.pageNo = 1; // default page number set to 0
  $scope.viewMode = 'list';
  $scope.numOfPagesPerView = 5;
  $scope.viewMode = 0;

  $scope.isSelectable = angular.isDefined($scope.multiselectOptions) ? true:false;
  $scope.haveOptions = angular.isDefined($scope.options) ? true:false;
  $scope.canCreate = angular.isDefined($scope.canCreate) ? $scope.canCreate:false;
  $scope.searchShow = angular.isDefined($scope.search)? $scope.search : false;

  $scope.$watch('tableData' , function(newValue , oldValue){
    $scope.selectStates = [];
    if ($scope.isSelectable) {
      for (var i = 0; i < $scope.tableData.length; i++) {
        $scope.selectStates.push({value : false , disabled : false});
      }
    }
  });



  $scope.$on('forceInsetTableData', function(event, input) {
    // console.log($scope.tableData);
    $scope.tableData.push(input);
  });

  $scope.create = function(){
    // the template is in $scope.itemTemplate
    $scope.createModalInstance = $uibModal.open({
      templateUrl: $scope.editorTemplate,
      size: 'lg',
      scope:$scope, //Refer to parent scope here
      resolve: {
       rowScope: function () {
         return $scope.rowScope; // put stuffs in $scope.rowScope.newFormData
       },
       submitFormFn : function(){
         return $scope.callbackFn; // pass data directly from the template to the callbackFn
       }
      },
      controller: function($scope , rowScope , submitFormFn ){
        $scope.submitForm = submitFormFn;
        // $scope.data = row
        for (key in rowScope){
          $scope[key] = rowScope[key];
        }
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
      $scope.tableData.splice(index, 1);
      return;
    }
    $http({method : 'DELETE' , url : $scope.resourceUrl + pk + '/' }).
    then(function(response){
      $scope.tableData.splice(index, 1);
      if ($scope.tableData.length ==0) {
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
        if (typeof $scope.tableData[i].url == 'undefined') {
          items.push($scope.tableData[i].pk);
        } else{
          items.push($scope.tableData[i].url);
        }
      }
    }
    $scope.callbackFn(items , action , 'multi')
  };

  $scope.fullTextSearch = function(str){
    rowsContaining = [];
    str = str.toLowerCase();
    // console.log(str);
    for (var i = 0; i < $scope.originalTable.length; i++) {

      row = $scope.originalTable[i];
      for (key in row){
        val = row[key].toString().toLowerCase();
        if (val.indexOf(str) !=-1){
          rowsContaining.push(i)
          break;
        };
        rowNested = row[key];
        if (typeof rowNested == 'object') {
          for (keyNested in rowNested){
            if (rowNested[keyNested] != null) {
              valNested = rowNested[keyNested].toString().toLowerCase();
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

    $scope.tableData = [];
    for (var i = 0; i < rowsContaining.length; i++) {
      $scope.tableData.push($scope.originalTable[rowsContaining[i]]);
    }
  }
  $scope.fetchData = function(){
    // getting the data from the server based on the state of the filter params
    if (typeof $scope.getStr == 'undefined') {
      return;
    }
    fetch.method = 'GET';
    if (typeof $scope.primarySearchField == 'undefined' || $scope.primarySearchField =='') {
      fetch.url = $scope.resourceUrl +'?&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
    } else {
      fetch.url = $scope.resourceUrl +'?&'+ $scope.primarySearchField +'__contains=' + $scope.getStr + '&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
    }
    if (typeof $scope.getParams != 'undefined') {
      for (var i = 0; i < $scope.getParams.length; i++) {
        fetch.url += '&'+$scope.getParams[i].key + '='+ $scope.getParams[i].value;
      }
    }
    $http({method: fetch.method, url: fetch.url}).
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
        $scope.tableData = response.data.results;
        $scope.originalTable = angular.copy($scope.tableData);
        $scope.sortFlag = [];
        $scope.tableHeading = [];
        for (key in $scope.tableData[0]){
          $scope.tableHeading.push(key);
          $scope.sortFlag.push(0);  // by default no sort is applied , 1 for accending and -1 for descending
        }
        if ($scope.isSelectable) {
          $scope.tableHeading.unshift('Select');
          $scope.sortFlag.unshift(-2); // no sort can be applied on this column
        }

        if ($scope.haveOptions) {
          $scope.tableHeading.push('Options')
          $scope.sortFlag.push(-2); // no sort possible
        }
      }, function(response) {

    });
  }


  $scope.$watch('getStr' , function(){ // getStr is the search query sent to the server
    $scope.fetchData();
  });

  $scope.$watch('searchText',function(){
    $scope.updateData()
  });

  $scope.updateData = function(){ // at any point of time forcing to refresh data
    parts = $scope.searchText.split('>');
    if (typeof $scope.primarySearchField == 'undefined' || $scope.primarySearchField == '') {
      searchStr = $scope.searchText;
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
    $scope.changePage(1);
    $scope.fetchData();
    // console.log($scope.pageNo);
  }
  $scope.sort = function(col){
    $scope.tableSnap = angular.copy($scope.tableData);
    if ($scope.sortFlag[col]==-2) {
      console.log("No sort possible");
      return;
    }

    // console.log("will sort according to col " + col);
    colData = [];
    len =$scope.tableData.length;
    var indices = new Array(len);
    for (var i = 0; i < len; i++) {
      colData.push($scope.tableData[i][$scope.tableHeading[col]]);
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
      $scope.tableData[i] = angular.copy($scope.tableSnap[indices[i]])
    }
  };
});

app.directive('tableRow', function () {
  return {
    templateUrl:  '/static/ngTemplates/genericTable/tableRow.html',
    restrict: 'A',
    transclude: true,
    replace: true,
    scope:{
      data : '=', // individual row data
      rowAction : '=', // originally the callbackFn function
      options : '=', // dropdown menu options passed as options in the main directive
      checkbox : '=', // boolean flag for the value of the checkbox binded to the table
      // directive scope where it will collect the state of the checkboxes and passed to
      //the main controller upon selecting the multi select option
      selectable : '=', // if true there will be a checkbox
      rowScope : '=', // contains row specific function which can be called in the template {editorTemplate , fun1 , fun2 , .. and so on }
      // passed as rowInput in the main table directive
      index : '@', // the index of the item in the repeat
      delete :'=', // delete callback function
      editorTemplate : '@', // the template to be used in the modal popup
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
      template : '@',
      data : '=',
      rowAction : '=',
      options : '=',
      checkbox : '=',
      selectable : '=',
      rowScope : '=',
      index: '@',
      delete: '=',
      editorTemplate : '@',
    },
    controller : 'genericTableItem',
  };
});

app.controller('genericTableItem' , function($scope , $uibModal){
  if (typeof $scope.data.url == 'undefined') {
    $scope.target = $scope.pk;
  } else {
    $scope.target = $scope.data.url;
    $scope.pk = getPK($scope.data.url);
  }

  $scope.rowActionClicked = function(option){
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
       rowScope: function () {
         return $scope.rowScope;
       },
       submitFormFn : function(){
         return $scope.submitForm;
       },
       data : function(){
         return $scope.data;
       }
      },
      controller: function($scope , rowScope , submitFormFn , data){
        $scope.submitForm = submitFormFn;
        for (key in rowScope){
          $scope[key] = rowScope[key];
        }
        $scope.data = data;
        $scope.data.formData = [];
        $scope.mode = 'edit';
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
