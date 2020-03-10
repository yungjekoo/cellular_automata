var canvas = document.getElementById("id");
console.log(canvas);
var ctx = canvas.getContext("2d");

var gameEngine = new GameEngine();
gameEngine.init(ctx);
gameEngine.start();

var socket = io.connect("http://24.16.255.56:8888");

socket.on("load", function(data) {
  // load saved data
  console.log(data);
  gameEngine.reset();
  gameEngine.simulationBegin = false;
  gameEngine.generation = data.data.generation;
  gameEngine.genDisplay.innerHTML = data.data.generation;
  for (var i=0; i<gameEngine.entities.length; i++) {
    gameEngine.entities[i].state = data.data.cell_state[i];
  }
});

var text = document.getElementById("text");
var save = document.getElementById("save");
var load = document.getElementById("load");

save.onclick = function() {
  console.log("save");
  text.innerHTML = "saved";
  var stateArray = [];
  for (var i=0; i<gameEngine.entities.length; i++) {
    stateArray.push(gameEngine.entities[i].state);
  }
  var simulation_data = {generation: gameEngine.generation, cell_state: stateArray};
  // put the state of the simulation in an object
  socket.emit("save", {studentname: "Yung Koo", statename: "ca_simulation", data: simulation_data});
}

load.onclick = function() {
  console.log("load");
  text.innerHTML = "loaded";
  socket.emit("load", {studentname: "Yung Koo", statename: "ca_simulation"});
}

document.getElementById("start").onclick = function() {
  console.log("start");
  gameEngine.simulationBegin = true;
  console.log(gameEngine.initialConditions);
  gameEngine.inititalConditions = [];
};

document.getElementById("pause").onclick = function() {
  console.log("pause");
  gameEngine.simulationBegin = false;
}

document.getElementById("reset").onclick = function() {
  console.log("reset");
  gameEngine.reset();
};

document.getElementById("rules").onchange = function() {
  var x = document.getElementById("rules").value;
  console.log(x);
  gameEngine.rule = x;
}

document.getElementById("config").onchange = function() {
  gameEngine.reset();
  var x = document.getElementById("config").value;
  console.log(x);
  gameEngine.setBoard(x);
}
