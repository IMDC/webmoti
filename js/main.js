var mainUser;
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyA51GCqxDw7AuvfNmCcWjbGLtClJNFaUxE",
  authDomain: "webmotia.firebaseapp.com",
  databaseURL: "https://webmotia.firebaseio.com",
  projectId: "webmotia",
  storageBucket: "webmotia.appspot.com",
  messagingSenderId: "606747164317",
  appId: "1:606747164317:web:952c390708ccb09d"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

var loggedInElements = document.getElementById("logged-in-elements");
var uid;
var userStatusDatabaseRef;
var isOfflineForDatabase;
var isOnlineForDatabase;
var userStatusFirestoreRef;
// Check if user is authenticated
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // Fetch the current user's ID from Firebase Authentication.
    uid = firebase.auth().currentUser.uid;
    var isOfflineForDatabase = {
      state: "offline",
      last_changed: firebase.database.ServerValue.TIMESTAMP
    };

    var isOnlineForDatabase = {
      state: "online",
      last_changed: firebase.database.ServerValue.TIMESTAMP
    };
    // Create a reference to this user's specific status node.
    // This is where we will store data about being online/offline.
    userStatusDatabaseRef = firebase.database().ref("/status/" + uid);
    console.log("Logged in", user)
    firebase
      .database()
      .ref(".info/connected")
      .on("value", snapshot => {
        if (snapshot.val() == false) {
          return;
        }

        userStatusDatabaseRef
          .onDisconnect()
          .set(isOfflineForDatabase)
          .then(() => {
            userStatusDatabaseRef.set(isOnlineForDatabase);
          });
      });

    db.collection("Users")
      .doc(user.email)
      .get()
      .then(doc => {
        if (doc.exists) {
          let data = doc.data();
          loggedInElements.style.display = "block";
          loggedIn(data);
        } else {
          // Undefined
          console.log("No Such Document");
          loggedInElements.style.display = "none";
          window.location.replace("login.html");
        }
      })
      .catch(err => {
        console.log("Error getting document: ", err);
      });
  } else {
    // Redirect user to login
    loggedInElements.style.display = "none";
    window.location.replace("login.html");
  }
});
window.addEventListener("beforeunload", function(e) {
  db.collection("Users")
    .doc(mainUser.email)
    .set({
      email: mainUser.email,
      teacherEmail: mainUser.teacherEmail,
      displayName: mainUser.displayName,
      status: "offline"
    })
    .then(function() {
      console.log("Logged On!!");
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
});
// firebase.database().ref(".info/connected").on("value", snap => {
//   if (snap.val() == true) {
//     db.collection("Users")
//       .doc(mainUser.email)
//       .set({
//         email: mainUser.email,
//         teacherEmail: mainUser.teacherEmail,
//         displayName: mainUser.displayName,
//         status: "online"
//       })
//       .then(function() {
//         console.log("Logged On!!");
//       })
//       .catch(function(error) {
//         console.error("Error adding document: ", error);
//       });
//   } else {
//     db.collection("Users")
//       .doc(mainUser.email)
//       .set({
//         email: mainUser.email,
//         teacherEmail: mainUser.teacherEmail,
//         displayName: mainUser.displayName,
//         status: "offline"
//       })
//       .then(function() {
//         console.log("Logged On!!");
//       })
//       .catch(function(error) {
//         console.error("Error adding document: ", error);
//       });
//   }
// });
function logOut() {
  firebase.auth().signOut();
}

// Runs once logged in
function loggedIn(initialUser) {
  var user = initialUser;
  //Initialize Socket.io
  var socket = io("http://localhost:3000", { reconnectionAttempts: 3 });

  //Initializing the variables
  var teacherUser;
  var email = user.email;
  const constraints = { audio: true, video: true };
  var targetIcon = document.getElementById("targetIcon");
  var targetUsername = document.getElementById("targetUsername");
  var targetUsernameLabel = document.getElementById("targetUsernameLabel");
  var username = document.getElementById("username");
  var usernameLabel = document.getElementById("usernameLabel");
  var roleRadio = document.getElementById("roleRadio");
  var remoteVideo = document.getElementById("remoteVideo");
  var localVideo = document.getElementById("localVideo");
  var hangupButton = document.getElementById("hangup");
  var callButton = document.getElementById("call");
  var logoutButton = document.getElementById("drawer-logout-button");

  // drawer setup
  var drawer = mdc.drawer.MDCDrawer.attachTo(
    document.querySelector(".mdc-drawer")
  );
  var drawerList = new mdc.list.MDCList(document.getElementById("drawer-list"));
  // header setup
  var drawerHeaderName = document.getElementById("drawer-header-name");
  var drawerHeaderEmail = document.getElementById("drawer-header-email");
  var drawerSettingsButton = document.getElementById("drawer-settings-button");
  var drawerHomeButton = document.getElementById("drawer-home-button");
  const targetUsernameTextInput = new mdc.textField.MDCTextField(
    document.querySelector("#targetUsernameTextInput")
  );
  const usernameTextInput = new mdc.textField.MDCTextField(
    document.querySelector("#usernameTextInput")
  );
  // Allow drawer to open
  var drawerOpenButton = document.getElementById("drawer-open-button");

  // settgings modal
  var settingsModal = document.getElementById("myModal");
  var settingsSpan = document.getElementsByClassName("close")[0];
  const teacherChangeEmailTextInput = new mdc.textField.MDCTextField(
    document.querySelector("#teacher-input-text-field")
  );
  var teacherInputTextField = document.getElementById(
    "teacher-input-text-field"
  );
  var teacherChangeEmailLabel = document.getElementById(
    "teacher-input-label-field"
  );
  var teacherChangeEmailInput = document.getElementById(
    "teacher-change-email-input"
  );
  var saveTeacherEmailButton = document.getElementById(
    "edit-teacher-email-button"
  );
  var editSaveTeacherEmailSpan = new mdc.ripple.MDCRipple(
    document.getElementById("edit-teacher-email-span")
  );
  var teacherEmailChangeNotch = document.getElementById(
    "teacher-change-email-notch"
  );
  var teacherEmailChangeWidth = document.getElementById(
    "teacher-change-email-width"
  );
  const teacherChangeEmailSnackbar = new mdc.snackbar.MDCSnackbar(
    document.getElementById("change-teacher-email-snackback")
  );
  var undoTeacherEmailChangeButton = document.getElementById(
    "undo-change-teacher-email-button"
  );
  const teacherRetypeEmailInput = new mdc.textField.MDCTextField(
    document.querySelector("#teacher-input-retype-text-field")
  );
  var teacherRetypeEmailInputWorkable = document.getElementById(
    "teacher-input-retype-text-field"
  );
  var teacherChangeRetypeInput = document.getElementById(
    "teacher-retype-email-input"
  );
  const teacherChangeEmailDifferentSnackbar = new mdc.snackbar.MDCSnackbar(
    document.getElementById("teacher-email-change-different-snackbar")
  );
  const teacherImproperChangeEmailSnackbar = new mdc.snackbar.MDCSnackbar(
    document.getElementById("improper-teacher-change-email-snackbar")
  );

  var previousTeacherEmail;

  var localStream = null;
  var pc = null;
  var isCaller = true;
  var isStudent = true;
  var mediaDetails;

  setRandomUser(username);
  function setRandomUser(textbox) {
    textbox.value = email;
  }

  initialize();

  targetUsername.addEventListener("click", clearBox);
  function clearBox() {
    targetUsername.value = "";
  }

  function logConnectionStates(event) {
    console.log("Connection state changed to: " + pc.connectionState);
    if (pc.connectionState == "connected") {
      hangupButton.classList.remove("disabled");
      callButton.classList.add("disabled");
    }
    if (
      pc.connectionState == "failed" ||
      pc.connectionState == "disconnected"
    ) {
      hangup();
    }
  }

  function logSignalingStates(event) {
    console.log("Signaling state changed to: " + pc.signalingState);
    if (pc.signalingState == "stable") {
      keyboardListener();
      zoom();
    }
  }

  //Adding an event listener to send our SDP info to the server
  //document.getElementById("connect").addEventListener("click", connect);
  callButton.addEventListener("click", call);
  // function connect()
  // {
  //   checkCaller();
  //   if(isCaller)
  //   {
  //   identifyAsCaller();
  //   }
  //   listenEvent();
  //
  //
  // }
  function call() {
    createPeerConnection();
    mediaDetails = getMedia(pc);
  }

  logoutButton.addEventListener("click", logOut);

  hangupButton.addEventListener("click", hangup);
  function hangup() {
    console.log("Hanging up");
    if (pc) {
      pc.ontrack = null;
      pc.onremovetrack = null;
      pc.onremovestream = null;
      pc.onicecandidate = null;
      pc.oniceconnectionstatechange = null;
      pc.onsignalingstatechange = null;
      pc.onicegatheringstatechange = null;
      pc.onnegotiationneeded = null;

      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
      }

      pc.close();
      pc = null;
    }

    remoteVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
    localVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");

    hangupButton.classList.add("disabled");
    callButton.classList.remove("disabled");
  }

  function checkCaller() {
    if (targetUsername.value != "") {
      isCaller = true;
    } else {
      isCaller = false;
    }
  }

  function createPeerConnection() {
    //Declaring iceServers and creating a new PeerConnection
    const config = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        },
        {
          urls: ["turn: app.webmoti.org:443"],
          username: "webmoti",
          credential: "webmoti_test"
        }
      ]
    };
    pc = new RTCPeerConnection(config);
    pc.onnegotiationneeded = offer;
    pc.onicecandidate = sendIce;
    pc.ontrack = handleTrackEvent;
    pc.onconnectionstatechange = logConnectionStates;
    pc.onsignalingstatechange = logSignalingStates;
  }
  //Getting the media from the browser
  function getMedia(pc) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream) {
        /* use the stream */
        localStream = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        document.getElementById("localVideo").srcObject = localStream;
      })
      .catch(function(err) {
        /* handle the error */
        console.log("failed to add Webcam" + err);
      });

    console.log("Got the Webcam/Media from the browser");
  }

  function offer() {
    //Creating a new offer and then set the local description of the RTCPeerConnection pc

    pc.createOffer()
      .then(function(offer) {
        console.log("Offer created!");
        return pc.setLocalDescription(offer);
      })
      .then(function() {
        console.log(
          "Placing the offer in the database under " +
            targetUsername.value +
            " username"
        );
        sendToServer(
          targetUsername.value,
          username.value,
          "video-offer",
          JSON.stringify(pc.localDescription)
        );
      });
  }
  function sendToServer(username, targetUsername, type, sdp) {
    const data = {
      username: username,
      targetUsername: targetUsername,
      type: type,
      sdp: sdp
    };

    console.log(
      "Sending data from " +
        username +
        " to " +
        targetUsername +
        " with type " +
        type
    );

    db.collection("SDP")
      .doc(username)
      .set(data)
      .then(function() {
        console.log("Document written ");
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }
  function sendToPeer(str) {
    sendToServer(targetUsername.value, username.value, "peer-data", str);
  }

  //The ice sending/receiving functions
  function sendIce(ice) {
    if (ice.candidate) {
      sendToServer(
        targetUsername.value,
        username.value,
        "ice-candidate",
        JSON.stringify(ice.candidate)
      );
      console.log("Sent new ICE candidate " + JSON.stringify(ice.candidate));
    }
  }
  function receiveIce(ice) {
    console.log("Received new ICE Candidate: " + ice);
    var cand = new RTCIceCandidate(JSON.parse(ice));
    pc.addIceCandidate(cand).catch(function(e) {
      console.log(e);
    });
  }

  function keyboardListener() {
    console.log("Adding the keyboard event listener");
    document.addEventListener(
      "keydown",
      event => {
        const keyName = event.key;

        switch (keyName) {
          case "q":
            sendToPeer(keyName);
            sendToPeer("");
            break;
          case "w":
            zoomIn();
            break;
          case "a":
            sendToPeer(keyName);
            sendToPeer("");
            break;
          case "s":
            zoomOut();
            break;
          case "d":
            sendToPeer(keyName);
            sendToPeer("");
            break;
          case "r":
            resetZoom();
            break;
          default:
          // code block
        }
      },
      false
    );
  }

  function identifyAsCaller() {
    console.log("Identifying self as Caller: " + username.value);
    sendToServer(
      targetUsername.value,
      username.value,
      "initial-registration",
      ""
    );
  }
  function initialize() {
    let teacherEmail = user.teacherEmail;
    targetUsername.value = teacherEmail;
    usernameLabel.innerHTML = user.displayName;

    db.collection("Users")
      .doc(user.teacherEmail)
      .get()
      .then(doc => {
        if (doc.exists) {
          teacherUser = doc.data();
          targetUsernameLabel.innerHTML = teacherUser.displayName;
        } else {
          // Undefined
          console.log("No Such Document");
        }
      })
      .catch(err => {
        console.log("Error getting document: ", err);
      });

    /* --------------------------------------------- */
    /* ------------MATERIAL DESIGN INIT--------------*/
    /* --------------------------------------------- */

    // open modal to see settins for user
    drawerSettingsButton.addEventListener("click", event => {
      // makes so that settings is not a transitionable drawer button
      // it is in a timeout because of conflict css transitions which solves
      //the problem
      setTimeout(() => {
        saveTeacherEmailButton.style.display = "none";
        teacherRetypeEmailInputWorkable.style.display = "none";
        drawerList.selectedIndex = 0;
        drawerSettingsButton.classList.remove("mdc-list-item--activated");
        drawerHomeButton.classList.add("mdc-list-item--activated");
        settingsModal.style.display = "flex";
        // Initial teacher email change input setup
        teacherChangeEmailInput.value = user.teacherEmail;
        teacherChangeEmailLabel.innerHTML = "Teacher Email";
        teacherEmailChangeNotch.classList.add("mdc-notched-outline--notched");
        teacherChangeEmailLabel.classList.add(
          "mdc-floating-label--float-above"
        );
        teacherEmailChangeWidth.style.width = "85.4px";
        previousTeacherEmail = targetUsername.value;
      }, 5);
    });

    drawerHeaderName.innerHTML = user.displayName;
    drawerHeaderEmail.innerHTML = user.email;

    mdc.ripple.MDCRipple.attachTo(drawerOpenButton);

    drawerOpenButton.addEventListener("click", function() {
      if (drawer.open) {
        drawer.open = false;
      } else {
        drawer.open = true;
      }
    });

    // Allow drawer to close when item in drawer is selected
    const listEl = document.querySelector(".mdc-drawer .mdc-list");
    listEl.addEventListener("click", event => {
      drawer.open = false;
    });

    settingsSpan.addEventListener("click", () => {
      settingsModal.click();
    });

    window.addEventListener("click", event => {
      if (event.target == settingsModal) {
        settingsModal.style.display = "none";
        // Reset teacher email editing
        teacherChangeEmailInput.value = user.teacherEmail;
        teacherChangeEmailLabel.innerHTML = "";
        // Remove notch, floating property, and reset width
        teacherEmailChangeNotch.classList.remove(
          "mdc-notched-outline--notched"
        );
        teacherChangeEmailLabel.classList.remove(
          "mdc-floating-label--float-above"
        );
        teacherChangeRetypeInput.value = "";
      }
      if (event.target == targetUsername) {
        targetUsernameLabel.innerHTML = "Other Classroom";
      }
      if (event.target != targetUsername) {
        if (targetUsernameTextInput.value == "") {
          targetUsernameTextInput.value = user.teacherEmail;
          targetUsernameLabel.innerHTML = "Home Classroom";
        } else if (targetUsernameTextInput.value == user.teacherEmail) {
          targetUsernameLabel.innerHTML = "Home Classroom";
        }
      }
    });
    // Undo button
    undoTeacherEmailChangeButton.addEventListener("click", () => {
      console.log(previousTeacherEmail);
      db.collection("Users")
        .doc(user.email)
        .set({
          displayName: user.displayName,
          email: user.email,
          teacherEmail: previousTeacherEmail
        })
        .then(function() {
          teacherChangeEmailLabel.innerHTML = "Teacher Email";
          user.teacherEmail = previousTeacherEmail;
          targetUsername.value = previousTeacherEmail;
          teacherChangeEmailSnackbar.close();
          console.log("Undid Change");
        })
        .catch(function(error) {
          console.error("Error changing email: ", error);
        });
    });

    // Edit/Save button
    var tempEmailInput = "";
    teacherChangeEmailInput.addEventListener("click", () => {
      if (teacherChangeEmailInput.value == user.teacherEmail) {
        teacherChangeEmailInput.value = "";
      }
      teacherRetypeEmailInputWorkable.style.display = "flex";
      saveTeacherEmailButton.style.display = "block";
      tempEmailInput = teacherChangeEmailInput.value;

      teacherChangeEmailLabel.innerHTML = "Teacher Email";
    });
    saveTeacherEmailButton.addEventListener(
      "click",
      () => {
        // Clicked on save

        if (teacherChangeRetypeInput.value == teacherChangeEmailInput.value) {
          // Same email
          var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (regexEmail.test(teacherChangeRetypeInput.value.toLowerCase())) {
            // valid email format
            console.log("Uploading email:", teacherChangeEmailInput.value);
            db.collection("Users")
              .doc(user.email)
              .set({
                displayName: user.displayName,
                email: user.email,
                teacherEmail: teacherChangeEmailInput.value
              })
              .then(function() {
                teacherChangeEmailLabel.innerHTML = "Teacher Email";
                user.teacherEmail = teacherChangeEmailInput.value;
                targetUsername.value = teacherChangeEmailInput.value;
                settingsModal.click();
                teacherChangeEmailSnackbar.open();
                console.log(user);
                console.log("Email Changed!!!");
              })
              .catch(function(error) {
                console.error("Error changing email: ", error);
              });
          } else {
            // Not valid email format
            teacherImproperChangeEmailSnackbar.open();
          }
        } else {
          teacherChangeEmailDifferentSnackbar.open();
        }
      }
      // teacherChangeEmailInput.value = "";
    );

    /* --------------------------------------------- */
    /* --------------------------------------------- */
    /* --------------------------------------------- */

    console.log("Identifying self with server: " + username.value);
    sendToServer(
      username.value,
      targetUsername.value,
      "initial-registration",
      ""
    );
    listenSelf();

    socket.on("connect", () => {
      console.log("Found Node Server, setting self as classroom");
      targetIcon.style.display = "none";
      targetUsername.hidden = true;
      callButton.style.display = "none";
      isStudent = false;
    });
  }

  function answer(call) {
    createPeerConnection();

    console.log(
      "Answering a call from: " +
        call.data().targetUsername +
        " with description " +
        call.data().sdp
    );
    console.log(JSON.parse(call.data().sdp));
    var desc = new RTCSessionDescription(JSON.parse(call.data().sdp));
    pc.setRemoteDescription(desc)
      .then(function() {
        return navigator.mediaDevices.getUserMedia(constraints);
      })
      .then(function(stream) {
        localStream = stream;
        document.getElementById("localVideo").srcObject = localStream;
        localStream
          .getTracks()
          .forEach(track => pc.addTrack(track, localStream));
      })
      .then(function() {
        return pc.createAnswer();
      })
      .then(function(answer) {
        return pc.setLocalDescription(answer);
      })
      .then(function() {
        sendToServer(
          targetUsername.value,
          username.value,
          "video-answer",
          JSON.stringify(pc.localDescription)
        );
      })
      .catch();
  }
  function listenTarget() {
    // We are listening for changes within the target user
    const target = targetUsername.value;
    //Setting up a listener for changes in targetUsername values in the database
    console.log("Fetching records matching username: " + target);
    db.collection("SDP")
      .doc(target)
      .onSnapshot(
        function(doc) {
          var user = doc.data().username;
          var targetUser = doc.data().targetUsername;
          var type = doc.data().type;
          var sdp = doc.data().sdp;

          if (type == "initial-registration") {
            console.log("Found caller username " + user);
            targetUsername.value = user;
          }
          // if(type == "video-offer")
          // {
          //   console.log("Received video offer!");
          //    answer(doc);
          // }
        },
        function(error) {
          console.log(error);
        }
      );
  }
  function handlePeerData(peerData) {
    console.log(peerData);

    switch (peerData) {
      case "w":
        zoomIn(1);
        break;
      case "a":
        //add motor left
        socket.emit("left");
        break;
      case "s":
        zoomOut(1);
        break;
      case "d":
        //add motor right
        socket.emit("right");
        break;
      case "q":
        socket.emit("stop");
        break;
      default:
      // code block
    }
  }
  function listenSelf() {
    console.log("Listening for changes in the entry matching our username ");
    db.collection("SDP")
      .doc(username.value)
      .onSnapshot(
        function(doc) {
          if (doc.exists) {
            console.log("Received data: ", doc.data());

            var user = doc.data().username;
            var targetUser = doc.data().targetUsername;
            var type = doc.data().type;
            var sdp = doc.data().sdp;

            if (type == "initial-registration") {
              console.log("Found a registration for our user " + user);
            }
            if (type == "video-offer") {
              console.log(
                "Received video offer from remote peer " + targetUser
              );
              console.log("Setting our targetUsername to " + targetUser);
              targetUsername.value = targetUser;
              listenTarget();
              answer(doc);
            } else if (type == "ice-candidate") {
              console.log("Received ICE candidate from user " + targetUser);
              receiveIce(sdp);
            } else if (type == "video-answer") {
              console.log("Received video-answer");
              var desc = new RTCSessionDescription(JSON.parse(sdp));
              pc.setRemoteDescription(desc).catch(function(e) {
                console.log(e);
              });
            } else if (type == "peer-data") {
              console.log("Received communication from peer: " + targetUser);
              handlePeerData(sdp);
            }
          }
        },
        function(error) {
          console.log(error);
        }
      );
  }

  function handleTrackEvent(event) {
    console.log(
      "Attaching remote video in signalling state: " +
        pc.signalingState +
        " and connection state: " +
        pc.connectionState
    );
    console.log(
      "Stream active status is: " +
        event.streams[0].active +
        " track readystate is: " +
        event.track.readyState +
        "track kind is: " +
        event.track.kind +
        " track is remote: " +
        event.track.remote
    );
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  }
}
