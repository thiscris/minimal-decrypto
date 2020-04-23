//import firebase from 'firebase';
require("firebase/functions");

// Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDlKYLvitISI5yfXmifazpYp6vBchqKfr0",
    authDomain: "submarine-safari.firebaseapp.com",
    databaseURL: "https://submarine-safari.firebaseio.com",
    projectId: "submarine-safari",
    storageBucket: "submarine-safari.appspot.com",
    messagingSenderId: "828655645333",
    appId: "1:828655645333:web:767a5c66e7051e86c4619c"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Initialize Cloud Functions through Firebase
  var functions = firebase.functions();


  var app = firebase.app();
  //console.log(app);


var socket = io();
socket.on('message', function(data) {
  console.log(data+" 2");
});

var db = firebase.database(app);
var dbRef = db.ref();
console.log(dbRef);
console.log(dbRef.collection);

dbRef.on("value", (snapshot)=> {
    console.log(snapshot.val());
});

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
  }
  document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
    }
  });
  document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = false;
        break;
      case 87: // W
        movement.up = false;
        break;
      case 68: // D
        movement.right = false;
        break;
      case 83: // S
        movement.down = false;
        break;
    }
  });

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});

var username = "go";
var CreateMatch = firebase.functions().httpsCallable('CreateMatch');
CreateMatch({username: username}).then(function(result) {
  // Read result of the Cloud Function.
  console.log(result.data.text);
  // ...
});

