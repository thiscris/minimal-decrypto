const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.database();

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    const snapshot = await admin.database().ref('/messages').push({original: original});
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref.toString());
  });




// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /matches/
// URL example https://us-central1-submarine-safari.cloudfunctions.net/CreateMatch?user=cris
exports.CreateMatch = functions.https.onRequest(async (req, res) => {

// CORS stuff
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
res.set('Access-Control-Allow-Headers', '*');

 if (req.method === 'OPTIONS') {
   res.end();
}

else{
//REAL FUNCTION STARTS HERE

    //Generate a random user id
    const rndUserId = "player"+Math.round(Math.random()*1000);
    // Grab the user parameter from the url or use the random user id from above.
    const username = req.query.user || rndUserId;

    var matchData = {
      host: username,
      state: "waiting for players",
      playernames: [username],
      Aencoder: [],
      Bencoder: [],
      Adecoder: [],
      Bdecoder: []
    };

    // Get a key for a new Match.
    var newMatchKey = db.ref('matches').push().key;
    console.log(newMatchKey);

    // Write the new match's data in the match list
    var updates = {};
    updates['/matches/' + newMatchKey] = matchData;
    //execute the update
    var server_resp = db.ref().update(updates);

    res.status(200).send({ data:{server_resp,newMatchKey} });
  }
});


//join an existing match
//parameters needed - user and matchID

exports.JoinMatch = functions.https.onRequest(async (req, res) => {
  // CORS stuff
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
     res.end();
  }
  


  //REAL FUNCTION STARTS HERE
  else{
    // Grab the user parameter from the url or use the random user id from above.
    if (req.query.user === undefined || req.query.matchID === undefined)
    {
      //missing parameters
      console.log("missing parameters in JoinMatch call")
      return res.status(500).send("missing parameters");
    }
    else {

      const username = req.query.user;
      const matchID = req.query.matchID;

      //retrieve match data
      db.ref('/matches/' + matchID).once("value")
      .then(function(snapshot){
        var obj = snapshot.val(); //retrieves the values from the snapshot
        
        //check if game is actually waiting for players
        if(obj.state=="waiting for players"){

          //add this player to the list of players
          var playerList = obj.playernames;
          playerList.push(username);

          // add it to updates
          var updates = {};
          updates['/matches/'+matchID+'/playernames'] = playerList;
          //execute the update
          db.ref().update(updates);

          //console.log(true);
          res.status(200).send({ data:"waiting for players" });

        } else {
          //console.log(false);
          res.status(200).send({ data:"not waiting for players" });

        }
      })
      .catch(error => {
        //handle errors
        console.log(error);
        res.status(500).send({ data:error});
      });
    }
  }
});


//Listens for changes in players list
//...

//updates player role during lobby
exports.SetRole = functions.https.onRequest(async (req, res) => {
  // CORS stuff
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
     res.end();
  }
  


  //REAL FUNCTION STARTS HERE
  else{
    // Grab the user parameter from the url or use the random user id from above.
    if (req.query.user === undefined || req.query.matchID === undefined || req.query.NewRole === undefined)
    {
      //missing parameters
      console.log("missing parameters in SetRole call")
      return res.status(500).send("missing parameters");
    }
    else {

      const username = req.query.user;
      const matchID = req.query.matchID;
      const OldRole = req.query.OldRole;
      const NewRole = req.query.NewRole;

      //retrieve match data
      db.ref('/matches/' + matchID).once("value")
      .then(function(snapshot){
        var obj = snapshot.val(); //retrieves the values from the snapshot
        
        //check if game is actually waiting for players
        if(obj.state=="waiting for players"){

          //add this player to the list of players for the new role
          //create such list if there isn't
          if (obj[NewRole]===undefined) {
            var RoleList = [username];
          } else {
            var RoleList = obj[NewRole];
            RoleList.push(username);
          }

          console.log(OldRole);

          //remove him from the list of his old role if he had any
          if (OldRole!="") {
            arr = obj[OldRole];
            const index = arr.indexOf(username);
            if (index > -1) {
              arr.splice(index, 1);
              
              updates['/matches/'+matchID+'/'+OldRole] = arr;
            }
          }

          // add it to updates
          var updates = {};
          updates['/matches/'+matchID+'/'+NewRole] = RoleList;

          //execute the update
          db.ref().update(updates);

          //console.log(true);
          res.status(200).send({ data:"role updated" });

        } else {
          //console.log(false);
          res.status(200).send({ data:"not waiting for players" });

        }
      })
      .catch(error => {
        //handle errors
        console.log(error);
        res.status(500).send({ data:error});
      });
    }
  }
});

//changes the game state
//updates player role during lobby
exports.SetState = functions.https.onRequest(async (req, res) => {
  // CORS stuff
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
     res.end();
  }
  


  //REAL FUNCTION STARTS HERE
  else{
    // Grab the user parameter from the url or use the random user id from above.
    if (req.query.matchID === undefined || req.query.NewState === undefined)
    {
      //missing parameters
      console.log("missing parameters in SetState call")
      return res.status(500).send("missing parameters");
    }
    else {

      const matchID = req.query.matchID;
      const NewState = req.query.NewState;

      //retrieve match data
      db.ref('/matches/' + matchID).once("value")
      .then(function(snapshot){
        var obj = snapshot.val(); //retrieves the values from the snapshot
      
          // add it to updates
          var updates = {};
          updates['/matches/'+matchID+'/state'] = NewState;

          //execute the update
          db.ref().update(updates);

          //console.log(true);
          res.status(200).send({ data:"state updated" });
      })
      .catch(error => {
        //handle errors
        console.log(error);
        res.status(500).send({ data:error});
      });
    }
  }
});