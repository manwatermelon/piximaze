var lastCalledTime;
var fps;
// create an new instance of a pixi stage
var stage = new PIXI.Container();
var fpsText;
var coordText;
var timerText;
var smiley;
var maze;
// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(600, 600, null, true);
var state;
var step = 16;
var collision = 0;
var canvas;
var ctx;
var left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);
var seconds = 0, minutes = 0, hours = 0, t;
var finishBox, isFinished = false, finishText;

//CanvasRenderingContext2D
//WebGLRenderingContext
// add the renderer view element to the DOM

window.onload = function() {
    document.body.appendChild(renderer.view);

    PIXI.loader
        .add('maze','resources/maze-thick.png')
        .add('smiley', 'resources/smiley.png')
        .on("progress", loadProgressHandler)
        .load(function (loader, resources)
        {
        maze = new PIXI.Sprite(resources.maze.texture);
        maze.position.x = 50;
        maze.position.y = 50;
        stage.addChild(maze);
        
        fpsText = new PIXI.Text("", {font: "arial 10px", fill: "#ffffff"})
        fpsText.position.x = 590;
        fpsText.position.y = 590;
        stage.addChild(fpsText);
        
        coordText = new PIXI.Text("", {font: "arial 10px", fill: "#ffffff"})
        coordText.position.x = 0;
        coordText.position.y = 590;
        stage.addChild(coordText);
        
        timerText = new PIXI.Text("", {font: "arial 15px", fill: "#ffffff"})
        timerText.position.x = 285;
        timerText.position.y = 570;
        stage.addChild(timerText);
        
        finishText = new PIXI.Text("", {font: "arial 30px", fill: "#ffffff"})
        finishText.position.x = 280;
        finishText.position.y = 540;
        finishText.align = 'center';
        stage.addChild(finishText);
        
        smiley = new PIXI.Sprite(resources.smiley.texture);
        smiley.x = 68;
        smiley.y = 103;
        smiley.vx = 0;
        smiley.vy = 0;
//        smiley.scale = new PIXI.Point(0.7, 0.7);
        smiley.width = 16;
        smiley.height = 16;
        stage.addChild(smiley);
        
        stage.interactive = true;
        stage.hitArea = new PIXI.Rectangle(0,0,600,600);
        
        
        finishBox = new PIXI.Sprite();
        finishBox.x = 295;
        finishBox.y = 515;
        finishBox.width = 20;
        finishBox.height = 15;
        stage.addChild(finishBox);
        
        setupMobileControls();
        
        left.press = function() {
            smiley.x += -step;
            smiley.vy = 0;
        };
//        left.release = function() {
//            if (!right.isDown && smiley.vy === 0) {
//              smiley.vx = 0;
//            }
//        };
        
        up.press = function() {
            smiley.y += -step;
            smiley.vx = 0;
        };
//        up.release = function() {
//            if (!down.isDown && smiley.vx === 0) {
//              smiley.vy = 0;
//            }
//        };
        
        right.press = function() {
            smiley.x += step;
            smiley.vy = 0;
        };
//        right.release = function() {
//            if (!left.isDown && smiley.vy === 0) {
//              smiley.vx = 0;
//            }
//        };
        
        down.press = function() {
            smiley.y += step;
            smiley.vx = 0;
        };
//        down.release = function() {
//            if (!up.isDown && smiley.vx === 0) {
//              smiley.vy = 0;
//            }
//        };
        
        
        stage.mousemove = stage.touchmove = stage.mousedown = stage.touchstart = stageMouseCoordPrint;
        
        canvas = renderer.view;
        ctx = canvas.getContext('webgl') || canvas.getContext("2d");
        state = play;
        t = setInterval(addSeconds, 1000);
        animate();
    });
}

function animate() {
    requestAnimationFrame(animate);
    //calculate fps
    if(!lastCalledTime) {
        lastCalledTime = Date.now();
        fps = 0;
        return;
    }
    delta = (Date.now() - lastCalledTime)/1000;
    lastCalledTime = Date.now();
    fps = 1/delta;
    fpsText.text = Math.round(fps * 10) / 10;
    
    state();
    
    //redraw all
    renderer.render(stage);
    
}

function stageMouseCoordPrint(mouseData) {
    var mouse = mouseData.data.getLocalPosition(stage);
    coordText.text = mouse.x + ',' + mouse.y;
}

function setupMobileControls() {
    var leftTapShape = new PIXI.Graphics();
    var leftPoints = [];
    leftPoints.push(new PIXI.Point(0, 0));
    leftPoints.push(new PIXI.Point(300, 300));
    leftPoints.push(new PIXI.Point(55, 530));
    leftTapShape.interactive = true;
    leftTapShape.buttonMode = true;
    leftTapShape.hitArea = new PIXI.Polygon(leftPoints);
    leftTapShape.position = new PIXI.Point(maze.position.x, maze.position.y);

    leftTapShape.mousedown = leftTapShape.touchstart = function (mouseData) {
//        console.log('touchstart left');
        smiley.vx = -step;
        smiley.vy = 0;
    }
    leftTapShape.mouseup = leftTapShape.touchend = function (mouseData) {
//        console.log('touchend left');
        smiley.vx = 0;
    }
    stage.addChild(leftTapShape);
    
    var rightTapShape = new PIXI.Graphics();
    var rightPoints = [];
    rightPoints.push(new PIXI.Point(530, 55));
    rightPoints.push(new PIXI.Point(300, 300));
    rightPoints.push(new PIXI.Point(530, 530));
    rightTapShape.interactive = true;
    rightTapShape.buttonMode = true;
    rightTapShape.hitArea = new PIXI.Polygon(rightPoints);
    rightTapShape.position = new PIXI.Point(maze.position.x, maze.position.y);

    rightTapShape.mousedown = rightTapShape.touchstart = function (mouseData) {
//        console.log('touchstart right');
        smiley.vx = step;
        smiley.vy = 0;
    }
    rightTapShape.mouseup = rightTapShape.touchend = function (mouseData) {
//        console.log('touchend right');
        smiley.vx = 0;
    }
    stage.addChild(rightTapShape);
    
    var topTapShape = new PIXI.Graphics();
    var topPoints = [];
    topPoints.push(new PIXI.Point(0, 0));
    topPoints.push(new PIXI.Point(300, 300));
    topPoints.push(new PIXI.Point(530, 55));
    topTapShape.interactive = true;
    topTapShape.buttonMode = true;
    topTapShape.hitArea = new PIXI.Polygon(topPoints);
    topTapShape.position = new PIXI.Point(maze.position.x, maze.position.y);

    topTapShape.mousedown = topTapShape.touchstart = function (mouseData) {
//        console.log('touchstart top');
        smiley.vy = -step;
        smiley.vx = 0;
    }
    topTapShape.mouseup = topTapShape.touchend = function (mouseData) {
//        console.log('touchend top');
        smiley.vy = 0;
    }
    stage.addChild(topTapShape);
    
    var botTapShape = new PIXI.Graphics();
    var botPoints = [];
    botPoints.push(new PIXI.Point(55, 530));
    botPoints.push(new PIXI.Point(300, 300));
    botPoints.push(new PIXI.Point(530, 530));
    botTapShape.interactive = true;
    botTapShape.buttonMode = true;
    botTapShape.hitArea = new PIXI.Polygon(botPoints);
    botTapShape.position = new PIXI.Point(maze.position.x, maze.position.y);

    botTapShape.mousedown = botTapShape.touchstart = function (mouseData) {
//        console.log('touchstart bot');
        smiley.vy = step;
        smiley.vx = 0;
    }
    botTapShape.mouseup = botTapShape.touchend = function (mouseData) {
//        console.log('touchend bot');
        smiley.vy = 0;
    }
    stage.addChild(botTapShape);
    
}

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

function loadProgressHandler(loader, resource) {

  //Display the file `url` currently being loaded
  console.log("loading: " + resource.name); 

  //Display the precentage of files currently loaded
  console.log("progress: " + loader.progress + "%"); 

  //If you gave your files names as the first argument 
  //of the `add` method, you can access them like this
  //console.log("loading: " + resource.name);
}

function play() {
    
    if (smiley.vx > 0) {
        //moving right
        checkCollision(smiley.x + smiley.width, smiley.y, 16, 16);
            if (collision == 1) {
            smiley.vx = 0;
            collision = 0;
            right.release();
            right.isUp = true;
            right.isDown = false;
        }
    } else if (smiley.vx < 0) {
        //moving left
        checkCollision(smiley.x - 16, smiley.y, 16, 16);
        if (collision == 1) {
            smiley.vx = 0;
            collision = 0;
            left.release();
            left.isUp = true;
            left.isDown = false;
        }
    } else if (smiley.vy > 0) {
        //moving down
        checkCollision(smiley.x, smiley.y + 16, smiley.width, 16);
        if (collision == 1) {
            smiley.vy = 0;
            collision = 0;
            down.release();
            down.isUp = true;
            down.isDown = false;
        }
    } else if (smiley.vy < 0) {
        //moving up
        checkCollision(smiley.x, smiley.y - 16, smiley.width, 16);
        if (collision == 1) {
            smiley.vy = 0;
            collision = 0;
            up.release();
            up.isUp = true;
            up.isDown = false;
        }
    }
//    smiley.x += smiley.vx;
//    smiley.y += smiley.vy;
    
    if (hitTestRectangle(smiley, finishBox) && !isFinished) {
        isFinished = true;
        finishText.text = 'FINISHED!';
        clearInterval(t);
        console.log('finish');
    }
    
    timerText.text = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
//    left
//                checkCollision(smiley.x - 5, smiley.y, 5, 11);
//            if (collision == 1) {
//                smiley.vx = 0;
//                collision = 0;
//                left.release();
//                left.isUp = true;
//                left.isDown = false;
//            }
    
//    up
//                checkCollision(smiley.x, smiley.y - 5, smiley.width, 5);
//            if (collision == 1) {
//                smiley.vy = 0;
//                collision = 0;
//                up.release();
//                up.isUp = true;
//                up.isDown = false;
//            }
    
//    right
//                checkCollision(smiley.x + smiley.width, smiley.y, 5, 11);
//            if (collision == 1) {
//                smiley.vx = 0;
//                collision = 0;
//                right.release();
//                right.isUp = true;
//                right.isDown = false;
//            }
    
//      down
//                checkCollision(smiley.x, smiley.y + 11, smiley.width, 5);
//            if (collision == 1) {
//                smiley.vy = 0;
//                collision = 0;
//                down.release();
//                down.isUp = true;
//                down.isDown = false;
//            }
}

function checkCollision(x, y, width, height) {
    var imgd = ctx.getImageData(x, y, width, height);
    var pix = imgd.data;
    for (var i = 0; n = pix.length, i < n; i += 4) {
        if (pix[i] == 0) {
            collision = 1;
//            console.log('collision!');
        }
    }
}

function addSeconds() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            hours++;
        }
    }
}

function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};