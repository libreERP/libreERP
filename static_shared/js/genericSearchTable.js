var genericSearchTable = angular.module('genericSearchTable', ['libreHR.directives' , 'ngSanitize', 'ui.bootstrap', 'ngAside']);

genericSearchTable.config(['$httpProvider' , function($httpProvider){
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
}]);

genericSearchTable.directive('genericTable', function () {
  return {
    templateUrl: '/static/ngTemplates/genericSearch.html',
    restrict: 'E',
    transclude: true,
    replace: false,
    scope: {
      tableData :'=',
      resourceUrl : '=',
      primarySearchField : '=',
      callbackFn : '=',
      views : '=',
      graphTemplate : '=',
      options : '=',
      multiselectOptions : '=',
      search : '=',
      getParams :'=',
    },
    controller : function($scope , $http, $templateCache, $timeout , userProfileService , $aside) {
      if ( typeof $scope.multiselectOptions == 'undefined' || $scope.multiselectOptions.length ==0 ) {
        $scope.isSelectable = false;
      } else {
        $scope.isSelectable = true;
      }

      if ( typeof $scope.options == 'undefined' || $scope.options.length ==0 ) {
        $scope.haveOptions = false;
      } else {
        $scope.haveOptions = true;
      }
      if ( typeof $scope.search == 'undefined' || $scope.search  ) {
        $scope.searchShow = true;
      } else {
        $scope.searchShow = false;
      }

      $scope.$watch('tableData' , function(newValue , oldValue){
        $scope.selectStates = [];
        if ($scope.isSelectable) {
          for (var i = 0; i < $scope.tableData.length; i++) {
            $scope.selectStates.push({value : false , disabled : false});
          }
        }
      });

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

      $scope.changeView = function(mode){
        $scope.viewMode = mode;
      }
      $scope.multiSelectAction = function(action){
        items = [];
        for (var i = 0; i < $scope.selectStates.length; i++) {
          if ($scope.selectStates[i].value == true) {
            items.push($scope.tableData[i].url);
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
      $scope.fetchData = function(searchStr){
        if (typeof searchStr=='undefined') {
          searchStr = '';
        }
        fetch.method = 'GET';
        if (typeof $scope.primarySearchField == 'undefined' || $scope.primarySearchField =='') {
          fetch.url = $scope.resourceUrl +'?&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
        } else {
          fetch.url = $scope.resourceUrl +'?&'+ $scope.primarySearchField +'__contains=' + searchStr + '&limit='+ $scope.itemsPerView + '&offset='+ ($scope.pageNo-1)*$scope.itemsPerView;
        }
        if (typeof $scope.getParams != 'undefined') {
          for (var i = 0; i < $scope.getParams.length; i++) {
            fetch.url += '&'+$scope.getParams[i].key + '='+ $scope.getParams[i].value;
          }
        }
        $http({method: fetch.method, url: fetch.url}).
          then(function(response) {
            // console.log(response);
            $scope.pageCount = Math.floor(response.data.count/$scope.itemsPerView)+1;
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

      $scope.$watch('getStr' , function(newValue , oldValue){
        $scope.fetchData(newValue);
      });

      $scope.$watch('searchText', function(newValue , oldValue){
        parts = newValue.split('>');
        if (typeof $scope.primarySearchField == 'undefined' || $scope.primarySearchField == '') {
          searchStr = newValue;
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
      });

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
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {

    }
  };
});

genericSearchTable.directive('tableRow', function () {
  return {
    templateUrl:  '/static/ngTemplates/tableRow.html',
    restrict: 'A',
    transclude: true,
    replace: true,
    scope:{
      data : '=',
      rowAction : '=',
      options : '=',
      checkbox : '=',
      selectable : '=',
    },
    controller : function($scope){

      if (typeof $scope.options == 'undefined') {
        $scope.optionsShow = false;
      }else{
        $scope.optionsShow = true;
      }
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {

    }
  };
});
// alert("Came in the ngSeachEmp js file");
