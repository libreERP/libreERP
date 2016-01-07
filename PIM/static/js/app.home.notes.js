app.controller("controller.home.notes", function($scope , $state , $users ,  $stateParams , $http , Flash) {
  $scope.me = $users.get('mySelf');
  $scope.editor = {pencil : false}
  $scope.canvas = new fabric.Canvas('canvas');
  $scope.canvas.isDrawingMode = false;

  $scope.bookInView = -1;
  $scope.pageInView = -1;
  $scope.notebooks = [];

  $scope.$watch('bookInView' , function(newValue , oldValue){
    if (newValue != -1) {
      console.log(newValue);
      console.log($scope);
      console.log($scope.notebooks[newValue]);
      if ($scope.notebooks[newValue].pages.length == 0) {
        dataToSend =  {
          source : 'blank',
          parent : $scope.notebooks[newValue].url,
          title : 'untitled',
          user : $scope.me.url,
        }
        $http({ method : 'POST' , url : '/api/PIM/page/' , data : dataToSend }).
        then(function(response){
          $scope.pageInView = 0;
          $scope.data = response.data;
        })
      } else {
        $scope.pageInView = 0;
        $scope.getPage();
      }
    }
  });

  $http({ method : 'GET' , url : '/api/PIM/notebook/'}).
  then(function(response){
    $scope.notebooks = response.data;
    if (response.data.length != 0) {
      $scope.bookInView = 0;
    } else{
      dataToSend = {
        user : $scope.me.url,
        title : 'untitled',
      }
      $http({ method : 'POST' , url : '/api/PIM/notebook/' , data : dataToSend }).
      then(function(response){
        $scope.notebooks.push(response.data);
        $scope.bookInView = 0;
      })
    }
  })

  $scope.getPage = function(){
    $http({ method : 'GET' , url : $scope.notebooks[$scope.bookInView].pages[$scope.pageInView] }).
    then(function(response){
      $scope.data = response.data;
      $scope.canvas.loadFromJSON($scope.data.source , $scope.canvas.renderAll.bind($scope.canvas) );
    })
  }

  $scope.changeNotebook = function(index){
    $scope.bookInView = index;
  }

  $scope.changePage = function(index){
    $scope.pageInView = index;
    $scope.getPage();
  }

  $scope.save = function(){
    console.log($scope);
    dataToSend = {
      source : JSON.stringify($scope.canvas),
      parent : $scope.notebooks[$scope.bookInView].url,
      title : $scope.data.title,
      user : $scope.me.url,
    }
    $http({ method : 'PATCH' , url : $scope.data.url , data : dataToSend }).
    then(function(response){
      Flash.create('success' , response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    })
  }

  $scope.pencil = function(){
    $scope.canvas.isDrawingMode = !$scope.canvas.isDrawingMode;
    $scope.editor.pencil = !$scope.editor.pencil;
  }

  $scope.clearAll = function(){
    $scope.canvas.clear().renderAll();
  }

  $scope.addText = function(e){
    newText = new fabric.IText('', {
      fontFamily: 'arial black',
      left: e.layerX,
      top: e.layerY ,
      fontSize:20,
    });
    $scope.canvas.add(newText);
    $scope.canvas.setActiveObject(newText);
    newText.enterEditing();
    newText.hiddenTextarea.focus();

  }
  $scope.canvas.on('mouse:down', function(options) {
    if (!$scope.canvas.isDrawingMode){
      $scope.addText(options.e);
    }
  });


  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    $scope.canvas.setHeight(window.innerHeight*0.75);
    $scope.canvas.setWidth(window.innerWidth*0.88);
    $scope.canvas.renderAll();
  }

  // resize on init
  resizeCanvas();

  $scope.canvas.on('object:moving', function (e) {
    var obj = e.target;
     // if object is too big ignore
    if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
      return;
    }
    obj.setCoords();
    // top-left  corner
    if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
      obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
    }
    // bot-right corner
    if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
      obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
      obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
    }
  });



});
