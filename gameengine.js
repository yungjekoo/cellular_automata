window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function GameEngine() {

    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.entities = [];
    this.nextGen = [];
    this.leftSideCells = [];
    this.rightSideCells = [];
    this.initialConditions = [];
    this.generation;
    this.genDisplay;
    this.simulationBegin;
    this.simulationEnd;

    this.rule;


}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.generation = 0;
    this.genDisplay = document.getElementById("generation");
    this.genDisplay.innerHTML = 0;
    this.startIndex = 0;
    this.stopIndex = 141;
    this.simulationBegin = false;
    this.simulationEnd = false;

    this.rule = '';

    this.startMouseInput();
    // Cell array instantiation
    var dx = 0;
    var dy = 0;
    for (var y=0; y<141; y++) {
      for (var x=0; x<141; x++) {
        var cell = new Cell(this, dx, dy, ((141*y) + x));
        this.entities.push(cell);
        dx += 5;
      }
      dx = 0;
      dy += 5;
    }
    for (var y=0; y<141; y++) {
      for (var x=0; x<141; x++) {
        var cell = new Cell(this, dx, dy, ((141*y) + x));
        this.nextGen.push(cell);
        dx += 5;
      }
      dx = 0;
      dy += 5;
    }
    var l = 0;
    for (var i=0; i<141; i++) {
      this.leftSideCells.push(l);
      l += 141;
    }
    var r = 140;
    for (var j=0; j<141; j++)
    {
      this.rightSideCells.push(r);
      r += 141;
    }
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.reset = function () {

  this.entities = [];
  this.nextGen = [];
  this.initialConditions = [];

  this.generation = 0;
  this.genDisplay.innerHTML = 0;
  this.startIndex = 0;
  this.stopIndex = 141;
  this.simulationBegin = false;
  this.simulationEnd = false;

  // Cell array instantiation
  var dx = 0;
  var dy = 0;
  for (var y=0; y<141; y++) {
    for (var x=0; x<141; x++) {
      var cell = new Cell(this, dx, dy, ((141*y) + x));
      this.entities.push(cell);
      dx += 5;
    }
    dx = 0;
    dy += 5;
  }
  for (var y=0; y<141; y++) {
    for (var x=0; x<141; x++) {
      var cell = new Cell(this, dx, dy, ((141*y) + x));
      this.nextGen.push(cell);
      dx += 5;
    }
    dx = 0;
    dy += 5;
  }
}

GameEngine.prototype.loop = function () {
    if (this.simulationBegin && !this.simulationEnd)
    {
      this.clockTick = this.timer.tick();
      if (this.timer.gameTime % 10 === 0) {
        this.update();
        this.draw();
        this.generation++;
        this.genDisplay.innerHTML = this.generation;
        if (this.generation === 10000) {
          this.simulationEnd = true;
        }
      }
    }
    else
    {
      this.draw();
    }
}

GameEngine.prototype.update = function () {
  if (this.rule === 'rule90')
  {
    for (this.startIndex; this.startIndex<this.stopIndex; this.startIndex++) {
      if (this.leftSideCells.includes(this.startIndex)) // left hand side, right neighbor only
      {
        if (this.entities[this.startIndex+1].state)
          {
            this.entities[this.startIndex+141].state = 1;
          }
      }
      else if (this.rightSideCells.includes(this.index)) // right hand side, left neighbor only
      {
        if (this.entities[this.startIndex-1].state)
          {
            this.entities[this.startIndex+141].state = 1;
          }
      } else {
          var lState = this.entities[this.startIndex-1].state;
          var rState = this.entities[this.startIndex+1].state;
          if (XOR(lState, rState))
          {
            this.entities[this.startIndex+141].state = 1;
          }
      }
    }
    this.startIndex++;
    this.stopIndex += 141;
    if (this.stopIndex === 19881) {
      this.simulationEnd = true;
    }
  }
  else if (this.rule === 'life')
  {
    for (var y=0; y<141; y++) {
      for (var x=0; x<141; x++) {
        var index = x + (141*y);
        var cell = this.entities[index];
        if (this.leftSideCells.includes(index))
        {
          if (index === 0) // top left corner cell
          {
            // moore neighborhood
            var n = this.entities[19740].state;
            var ne = this.entities[19741].state;
            var e = this.entities[1].state;
            var se = this.entities[142].state;
            var s = this.entities[141].state;
            var sw = this.entities[281].state;
            var w = this.entities[140].state;
            var nw = this.entities[19880].state;
            var sum = n + ne + e + se + s + sw + w + nw;
            if (cell.state === 0) // Birth
            {
              if (sum === 3)
              {
                //this.state = 1;
                this.nextGen[index].state = 1;
              }
            } else {             // Survival or Death
                if (sum === 2 || sum === 3)
                {
                  this.nextGen[index].state = 1;
                } else {
                  //this.state = 0;
                  this.nextGen[index].state = 0;
                }
            }
          }
          else if (index === 19740) // bottom left corner cell
          {
            // moore neighborhood
            var n = this.entities[19599].state;
            var ne = this.entities[19600].state;
            var e = this.entities[19741].state;
            var se = this.entities[1].state;
            var s = this.entities[0].state;
            var sw = this.entities[140].state;
            var w = this.entities[19880].state;
            var nw = this.entities[19739].state;
            var sum = n + ne + e + se + s + sw + w + nw;
            if (cell.state === 0) // Birth
            {
              if (sum === 3)
              {
                //this.state = 1;
                this.nextGen[index].state = 1;
              }
            } else {             // Survival or Death
                if (sum === 2 || sum === 3)
                {
                  // no change, survival
                  this.nextGen[index].state = 1;
                } else {
                  //his.state = 0;
                  this.nextGen[index].state = 0;
                }
            }
          } else { // left border cell
            // moore neighborhood
            var n = this.entities[index-141].state;
            var ne = this.entities[index-140].state;
            var e = this.entities[index+1].state;
            var se = this.entities[index+142].state;
            var s = this.entities[index+141].state;
            var sw = this.entities[index+281].state;
            var w = this.entities[index+140].state;
            var nw = this.entities[index-1].state;
            var sum = n + ne + e + se + s + sw + w + nw;
            if (cell.state === 0) // Birth
            {
              if (sum === 3)
              {
                //this.state = 1;
                this.nextGen[index].state = 1;
              }
            } else {             // Survival or Death
              if (sum === 2 || sum === 3)
              {
                // no change, survival
                this.nextGen[index].state = 1;
              } else {
                  //this.state = 0;
                  this.nextGen[index].state = 0;
              }
            }
          }
        }
        else if (this.rightSideCells.includes(index))
        {
          if (index === 140) // top right corner cell
          {
            // moore neighborhood
            var n = this.entities[19880].state;
            var ne = this.entities[19740].state;
            var e = this.entities[0].state;
            var se = this.entities[141].state;
            var s = this.entities[281].state;
            var sw = this.entities[280].state;
            var w = this.entities[139].state;
            var nw = this.entities[19879].state;
            var sum = n + ne + e + se + s + sw + w + nw;
            if (cell.state === 0) // Birth
            {
              if (sum === 3)
              {
                //this.state = 1;
                this.nextGen[index].state = 1;
              }
            } else {             // Survival or Death
                if (sum === 2 || sum === 3)
                {
                  this.nextGen[index].state = 1;
                } else {
                  //this.state = 0;
                  this.nextGen[index].state = 0;
                }
            }
          }
          else if (index === 19880) // bottom right corner cell
          {
            // moore neighborhood
            var n = this.entities[19739].state;
            var ne = this.entities[19599].state;
            var e = this.entities[19740].state;
            var se = this.entities[0].state;
            var s = this.entities[140].state;
            var sw = this.entities[139].state;
            var w = this.entities[19879].state;
            var nw = this.entities[19738].state;
            var sum = n + ne + e + se + s + sw + w + nw;
            if (cell.state === 0) // Birth
            {
              if (sum === 3)
              {
                //this.state = 1;
                this.nextGen[index].state = 1;
              }
            } else {             // Survival or Death
                if (sum === 2 || sum === 3)
                {
                  // no change, survival
                  this.nextGen[index].state = 1;
                } else {
                  //this.state = 0;
                  this.nextGen[index].state = 0;
                }
            }
          } else { // right border cell
            // moore neighborhood
            var n = this.entities[index-141].state;
            var ne = this.entities[index-281].state;
            var e = this.entities[index-140].state;
            var se = this.entities[index+1].state;
            var s = this.entities[index+141].state;
            var sw = this.entities[index+140].state;
            var w = this.entities[index-1].state;
            var nw = this.entities[index-142].state;
            var sum = n + ne + e + se + s + sw + w + nw;
            if (cell.state === 0) // Birth
            {
              if (sum === 3)
              {
                //this.state = 1;
                this.nextGen[index].state = 1;
              }
            } else {             // Survival or Death
                if (sum === 2 || sum === 3)
                {
                  // no change, survival
                  this.nextGen[index].state = 1;
                } else {
                  //this.state = 0;
                  this.nextGen[index].state = 0;
                }
            }
          }
        }
        else if (index > 0 && index < 141) // top border cell
        {
          // moore neighborhood
          var n = this.entities[index+19740].state;
          var ne = this.entities[index+19741].state;
          var e = this.entities[index+1].state;
          var se = this.entities[index+142].state;
          var s = this.entities[index+141].state;
          var sw = this.entities[index+140].state;
          var w = this.entities[index-1].state;
          var nw = this.entities[index+19739].state;
          var sum = n + ne + e + se + s + sw + w + nw;
          if (cell.state === 0) // Birth
          {
            if (sum === 3)
            {
              //this.state = 1;
              this.nextGen[index].state = 1;
            }
          } else {             // Survival or Death
              if (sum === 2 || sum === 3)
              {
                // no change, survival
                this.nextGen[index].state = 1;
              } else {
                //this.state = 0;
                this.nextGen[index].state = 0;
              }
          }
        }
        else if (index > 19740 && index < 19880) // bottom border cell
        {
          // moore neighborhood
          var n = this.entities[index-141].state;
          var ne = this.entities[index-140].state;
          var e = this.entities[index+1].state;
          var se = this.entities[index-19739].state;
          var s = this.entities[index-19740].state;
          var sw = this.entities[index-19741].state;
          var w = this.entities[index-1].state;
          var nw = this.entities[index-142].state;
          var sum = n + ne + e + se + s + sw + w + nw;
          if (cell.state === 0) // Birth
          {
            if (sum === 3)
            {
              //this.state = 1;
              this.nextGen[index].state = 1;
            }
          } else {             // Survival or Death
              if (sum === 2 || sum === 3)
              {
                // no change, survival
                this.nextGen[index].state = 1;
              } else {
                //this.state = 0;
                this.nextGen[index].state = 0;
              }
          }
        }
        else { // board cells
          // moore neighborhood
          var n = this.entities[index-141].state;
          var ne = this.entities[index-140].state;
          var e = this.entities[index+1].state;
          var se = this.entities[index+142].state;
          var s = this.entities[index+141].state;
          var sw = this.entities[index+140].state;
          var w = this.entities[index-1].state;
          var nw = this.entities[index-142].state;
          var sum = n + ne + e + se + s + sw + w + nw;
          if (cell.state === 0) // Birth
          {
            if (sum === 3)
            {
              //this.state = 1;
              this.nextGen[index].state = 1;
            }
          } else {             // Survival or Death
              if (sum === 2 || sum === 3)
              {
                // no change, survival
                this.nextGen[index].state = 1;
              } else {
                //this.state = 0;
                this.nextGen[index].state = 0;
              }
          }
        }
      }
    }
    for (var i=0; i<19881; i++) {
      if (this.nextGen[i].state === 0) this.entities[i].state = 0;
      else this.entities[i].state = 1;
    }
  }
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    this.entities.forEach(cell => cell.draw());
    this.ctx.restore();
}

GameEngine.prototype.setBoard = function(config) {
  if (config === '')
  {
    // do nothing
  }
  else if (config === 'switch')
  {
    var switchArray = [3688, 3829, 3689, 3830, 3698, 3558, 3840, 3560, 3984, 3985, 3983, 3843];
    switchArray.forEach(element => this.entities[element].state  = 1);
  }
  else if (config === 'sierpinski')
  {
    this.entities[71].state = 1;
  }
  else if (config === 'gosper')
  {
    var gosperArray = [1844, 1985, 1845, 1986, 1854, 1995, 2136, 1714, 2278,
                       1574, 1575, 2420, 2421, 1999, 1718, 2282, 2142, 2001,
                       1860, 2002, 1864, 1723, 1582, 1865, 1724, 1583, 2007,
                       1443, 1445, 1304, 2009, 2150, 1596, 1737, 1597, 1738];

    gosperArray.forEach(element => this.entities[element+3000].state = 1);
  }
  else if (config === 'simkin')
  {
    var simkinArray = [14949, 15090, 14950, 15091, 15376, 15517, 15377, 15518,
                       15097, 14956, 14957, 15098, 16380, 16521, 16662, 16663,
                       16664, 16240, 16241, 16243, 16244, 16386, 16528, 16668,
                       16808, 17367, 17366, 17507, 17649, 17651, 17650, 17792,
                       16531, 16532, 16673, 16672];

    simkinArray.forEach(element => this.entities[element].state = 1);
  }
  else if (config === 'eden')
  {
    var edenArray = [9181, 9182, 9323, 9324, 9465, 9184, 9466, 9326, 9186, 9468, 9608, 9748,
                     9750, 9606, 9605, 9746, 9745, 9328, 9610, 9469, 9329, 9611, 9189, 9753,
                     9331, 9472, 9613, 9473, 9191, 9755, 9192, 9333, 9474, 9615, 9756, 9475,
                     9193, 9335, 9617, 9757, 9195, 9759, 9337, 9478, 9619, 9479, 9339, 9198,
                     9480, 9762, 9621, 9481, 9199, 9763, 9200, 9341, 9482, 9623, 9764, 9342,
                     9483, 9624, 9343, 9625, 9202, 9766, 9203, 9204, 9345, 9486, 9627, 9768,
                     9767, 9205, 9206, 9487, 9769, 9770, 9629, 9488, 9347, 9208, 9207, 9349,
                     9490, 9631, 9772, 9771, 9489, 9491, 9351, 9633, 9211, 9775, 9776, 9635,
                     9494, 9353, 9212, 9213, 9214, 9355, 9637, 9778, 9777, 9496, 9495, 9215,
                     9216, 9357, 9498, 9497, 9639, 9780, 9779, 9358, 9359, 9640, 9641, 9500,
                     9501, 9219, 9783, 9361, 9502, 9643, 9503, 9221, 9785, 9363, 9504, 9645,
                     9223, 9787, 9365, 9506, 9647, 9225, 9789];
    edenArray.forEach(element => this.entities[element + 30].state = 1);
  }
}

GameEngine.prototype.startMouseInput = function () {

  var self = this;

  this.ctx.canvas.addEventListener('mousedown', function(e) {
    var coord = getCursorPosition(self.ctx.canvas, e);
    var index = findEntityIndex(coord.x, coord.y);
    if (self.entities[index].state === 0) {
      self.entities[index].state = 1;
      self.initialConditions.push(index);
    } else {
      self.entities[index].state = 0;
      const i = self.initialConditions.indexOf(index);
      if (index > -1) self.initialConditions.splice(i, 1);
    }
  });
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 1;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    /*
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    */
    this.gameTime += this.maxStep;
    return this.maxStep;
}

function XOR(a, b) {
  return (a || b) && !(a && b);
}

function Cell(game, x, y, index) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.index = index;
    this.width = 5;
    this.height = 5;
    this.state = 0;
    this.rule = this.game.rule;

  }

Cell.prototype.draw = function () {
    if (this.state === 0)
    {
      this.game.ctx.fillStyle = 'white';
    } else {
      this.game.ctx.fillStyle = 'black';
    }
    this.game.ctx.fillRect(this.x, this.y, this.width, this.height);


}

function getCursorPosition(canvas, event, game) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    var coord = {x: x, y: y}
    return coord;
}

function findEntityIndex(xClick, yClick) {
  var tx = Math.floor(xClick / 5);
  var ty = Math.floor(yClick / 5);
  return tx + 141*ty;
}
