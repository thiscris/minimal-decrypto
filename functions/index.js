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





//Creates a new match in the match list
// function CreateNewMatch(username) {
//   // A match entry.
//   var matchData = {
//     host: username,
//     state: "waiting for players",
//     playernames: username
//   };

//   // Get a key for a new Match.
//   var newMatchKey = admin.database().ref('matches').push().key;

//   // Write the new match's data in the match list
//   var updates = {};
//   updates['/matches/' + newMatchKey] = matchData;

//   //return admin.database().ref().update(updates);
//   res.send(newMatchKey);
// }

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /matches/
// URL example https://us-central1-submarine-safari.cloudfunctions.net/CreateMatch?user=cris

exports.CreateMatch = functions.https.onRequest(async (req, res) => {
  //Generate a random user id
  const rndUserId = "player"+Math.round(Math.random()*1000);
  // Grab the user parameter from the url or use the random user id from above.
  const username = req.query.user || rndUserId;

  var matchData = {
    host: username,
    state: "waiting for players",
    playernames: username
  };

  // Get a key for a new Match.
  var newMatchKey = admin.database().ref('matches').push().key;
  console.log(newMatchKey);

  // Write the new match's data in the match list
  var updates = {};
  updates['/matches/' + newMatchKey] = matchData;
  //execute the update
  var server_resp = admin.database().ref().update(updates);

  res.send({newMatchKey,server_resp});
});
