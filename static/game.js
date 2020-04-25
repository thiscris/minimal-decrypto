
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


var db = firebase.database(app);
var dbRef = db.ref();
var dbRef2 = db.ref("matches");


var localsettings = {default:""};

//calls a cloud function by name with given parameters and returns its output
fbaseFunc = function (name,parameters) {
  var str = name+"?";

  Object.entries(parameters).forEach(([key, value]) => 
    str +=key+"="+value+"&"
  );
  console.log(str);
  return firebase.functions().httpsCallable(str)();
}




document.getElementById("host-btn").onclick = function(){
  console.log(this);

  //get username from the input field
  var username = document.getElementById("nickname").value;
  localsettings.username = username;
  
  //calls the cloud function CreateMatch
  var matchID = fbaseFunc("CreateMatch",{user:username})
  .then(function(result) {
    // Read result of the Cloud Function.
    console.log(result);
    
    GoToLobby(result.data.newMatchKey);
  })
  .catch(error => {
    //handle error
    console.log(error);
  });


  console.log(matchID);
};

document.getElementById("join-btn").onclick = function(){
  console.log(this);
  //check if there is a valid MatchID - 19 characters, starts with M
  var joinID = document.getElementById("searchMatch").value;
  if (joinID.length == 19 && joinID[0]=="M") {

    //get username from the input field
    var username = document.getElementById("nickname").value;
    localsettings.username = username;

    //for some reason the database matchID starts with a dash and I don't like it, but it is what it is
    joinID = "-"+joinID;
    localsettings.matchID = joinID;

    //TODO check for duplicate names in match before joining

    //send a join request
    console.log("joining attempt");

    fbaseFunc("JoinMatch",{user:username,matchID:joinID})
    .then(function(){
      console.log("success");
      //go to lobby screen
      GoToLobby(joinID);
    })
    .catch(function(){
      console.log("what error is this?");
    });

    //then go to lobby

    // fails
    
  }
  else {
    //indicate that we need valid joinID
    console.log("valid ID required");
  }


};

document.getElementById("Aencoder").onclick = function(){SetRole(this.id)};
document.getElementById("Bencoder").onclick = function(){SetRole(this.id)};
document.getElementById("Adecoder").onclick = function(){SetRole(this.id)};
document.getElementById("Bdecoder").onclick = function(){SetRole(this.id)};

document.getElementById("start-btn").onclick = function(){
  //check if the button is enabled.
  if(document.getElementById("start-btn").getAttribute("class")=="btn"){
    GoToGame(); //could be imitted
    fbaseFunc("SetState",{matchID:localsettings.matchID,NewState:"Start"});
  }
};


GoToLobby = function(matchID) {
    

    //change screens
    document.getElementById("selection-screen").style.display="none";
    document.getElementById("lobby-screen").style.display="grid";

    //show game-id or link
    document.getElementById("game-url").textContent = "Match ID: "+matchID.substr(1,20);

    //listen for changes in the database
    var thisMatchRef = firebase.database(app).ref("/matches/"+matchID);
    thisMatchRef.on('value',function(data){
      console.log("CHANGE");
      var update = data.val();
      console.log(update); 

      //State check - did we start playing?
      if(update.state!="waiting for players") {
       GoToGame();
       return
      } 
      

      //Update players list
      UpdateList(update,"playernames");
      UpdateList(update,"Aencoder");
      UpdateList(update,"Bencoder");
      UpdateList(update,"Adecoder");
      UpdateList(update,"Bdecoder");
      

      //Check if ready to start
      //we have at least 1 player in each role
      console.log(update);

      var rolesarray = ["Aencoder","Bencoder","Adecoder","Bdecoder"];
      var rolesQ = 0; //count the players with assigned roles
      var readyCheck = "";
      rolesarray.forEach(element => {
        console.log(element);
        console.log(update[element]);
        if (update[element]!=undefined){
          if (update[element].length>0) {
            rolesQ += update[element].length;
          } else {
            //not ready
            readyCheck = "failed";
            console.log("empty roles!");
          }
        } else {
          //not ready
          console.log("empty roles!");
          readyCheck = "failed";
        }
      });

      console.log(readyCheck);
      console.log(update.playernames.length);
      console.log(rolesQ);

      if (readyCheck !="failed" && rolesQ==update.playernames.length) {
        console.log("ready to start");
        document.getElementById("start-btn").setAttribute("class","btn");
      }


    });
}

GoToGame = function() {

    //change screens
    document.getElementById("lobby-screen").style.display="none";
    document.getElementById("game-screen").style.display="grid";

    //listen for changes in the database
    var thisMatchRef = firebase.database(app).ref("/matches/"+localsettings.matchID);
    thisMatchRef.on('value',function(data){
      console.log("CHANGE");
      var update = data.val();
      console.log(update); 

      //State check - did we start playing?
      if(update.state=="waiting for players") {
       return
      } 

      console.log(update.state);

      //TODO this doesn't have to happen every update. Only once
      console.log(update.teamAwords);
      console.log(update.teamBwords);
      //gives you the words that belong to your team
      if( localsettings.role.substr(0,1)=="A") {
        localsettings.words = update.teamAwords;
      } else {
        localsettings.words = update.teamBwords;
      }

      for (i =0; i< 4; i++) {
        document.getElementById("word-"+(i+1)).innerHTML=localsettings.words[i];
      }

      console.log(update.state.substr(3,5));
      if (update.state.substr(3,5)=="coder"){
        console.log("yes");
        document.querySelectorAll("#position-indicator td").forEach ( e=> { 
          e.setAttribute("class","");
        });
        document.getElementById(update.state+"-indication").setAttribute("class","selected");
      }

    });

}




SetRole = function(newRole) {
  fbaseFunc("SetRole",
            {user : localsettings.username,
             matchID : localsettings.matchID,
             OldRole : localsettings.role || "",
             NewRole : newRole
            })
    .then(function(){
      localsettings.role = newRole;
      console.log(localsettings.username +" is a "+newRole);
    })
    .catch(function(){
      console.log("couldn't set new role");
  });

}


/*
 helper functions
  */

  //Update list
UpdateList = function(update,listName) {
  var names = update[listName];
  // console.log(listName+"-list");
  // console.log(names);
  document.getElementById(listName+"-list").innerHTML =""; // reset the list
  //iterate over each name
  if ( names != undefined) {
    for (i=0, len=names.length; i<len; i++){
      document.getElementById(listName+"-list").innerHTML +="<li class='playerName'>"+names[i]+"</li>";
    }
  }
}