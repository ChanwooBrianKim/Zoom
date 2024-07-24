const socket = io();

// Get elements from the DOM
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// Hide the room section initially
room.hidden = true;

let roomName;
let myStream;
let myPeerConnection;
let muted = false; // For zoom video
let cameraOff = false; // For zoom video
let roomName2; // For zoom video

// Function to add a message to the chat
function addMessage(message) {
  const ul = room.querySelector("ul"); // Find id #room and ul in the #room
  const li = document.createElement("li"); // Create li element
  li.innerText = message;
  ul.appendChild(li); // Append message to the ul
}

// Function to handle message submission
function handleMessageSubmit(event) {
  event.preventDefault(); // Prevent form default action
  const input = room.querySelector("#msg input"); // Find input in the id #msg
  const value = input.value;
  // Emit a new message event to the server
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`); // Add the message to the chat
  });
  input.value = ""; // Clear input field
}

// Function to show the room interface after joining
function showRoom() {
  welcome.hidden = true; // Hide 'welcome' section
  room.hidden = false; // Show 'room' section
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit); // Add event listener for message submission
}

// Function to handle room creation or joining
function handleRoomSubmit(event) {
  event.preventDefault(); // Prevent form default action
  const input = form.querySelector("input");
  roomName = input.value;
  socket.emit("enter_room", roomName, showRoom); // Emit room creation event and show room
  input.value = ""; // Clear input field
}

form.addEventListener("submit", handleRoomSubmit);

// Socket event handlers
socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`); // Notify room that user arrived
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ㅠㅠ`); // Notify room that user left
});

socket.on("new_message", addMessage); // Handle new messages

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = ''; // Clear existing room list
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

// Zoom video handling
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true; // Hide video call section initially

// Function to get list of cameras
async function getCameras() {
  // Check if media stream is available
  if (!myStream) {
    console.error('Media stream is not available');
    return;
  }
  
  try {
    // The enumerateDevices() method of the MediaDevices interface requests a list of the currently available media input and output devices
    const devices = await navigator.mediaDevices.enumerateDevices(); // Get a list of all media devices (audio and video)
    const cameras = devices.filter(device => device.kind === "videoinput"); // Filter out the video input devices (cameras)
    const currentCamera = myStream.getVideoTracks()[0]; // Get the currently active video track
    camerasSelect.innerHTML = ''; // Clear existing options
    // Iterate through the list of cameras
    cameras.forEach(camera => {
      const option = document.createElement("option"); // Create option element to home.pug
      option.value = camera.deviceId; // Set the value to the camera's device ID
      option.innerText = camera.label; // Set the text to the camera's label
      // Check if the current camera is the active camera and select it
      if (currentCamera && currentCamera.label === camera.label) {
        option.selected = true;
      }
      // Append the option to the cameras dropdown
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    // Log any errors encountered during the process
    console.error('Error getting cameras:', e);
  }
}

// Function to get media stream
async function getMedia(deviceId) {
  const constraints = {
    audio: true, // Requests access to the user's microphone.
    video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" } // Requests access to the user's camera
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(constraints);
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras(); // Get cameras if no deviceId is provided
    }
  } catch (e) {
    console.error('Error accessing media devices:', e);
  }
}

// Function to handle mute button click
function handleMuteClick() {
  // Check if myStream is Available
  if (!myStream) return; //If myStream is not available, the function exits early to avoid errors.

  // If a track is currently enabled, it will be disabled (muted), and if it is disabled, it will be enabled (unmuted)
  myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
  muteBtn.innerText = muted ? "Mute" : "Unmute"; // if muted True -> "Mute"
  muted = !muted; // Mute if mic on unmute if off
}

// Function to handle camera button click
function handleCameraClick() {
  if (!myStream) return; // Quick quit if no myStream

  myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
  cameraBtn.innerText = cameraOff ? "Turn Camera Off" : "Turn Camera On"; // if camera off true -> "Turn Camera Off"
  cameraOff = !cameraOff; // If cameraOff is currently true, it will be set to false, and vice versa.
}

// Function to handle camera selection change
async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  // checks if myPeerConnection (an RTCPeerConnection object) is defined
  if(myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    /**
    * myPeerConnection.getSenders() returns an array of RTCRtpSender objects, each representing a media track being sent to the remote peer.
    * find(sender => sender.track.kind === "video") searches through the array to find the sender that is responsible for sending a video track. 
    */
    const videoSender = myPeerConnection
      .getSenders()
      .find(sender => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack); // replaces the current video track being sent by videoSender with the new videoTrack obtained from the updated media stream.
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)
const welcome2 = document.getElementById("welcome2");
const welcomeForm = welcome2.querySelector("#callForm");

// Function to initialize the call
async function initCall() {
  welcome2.hidden = true;
  call.hidden = false;
  await getMedia(); // Get media stream
  makeConnection(); // Setup WebRTC connection
}

// Function to handle welcome form submission
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  roomName2 = input.value;
  await initCall();
  socket.emit("join_room", roomName2); // Emit room join event
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// WebRTC signaling
socket.on("welcome", async () => {
  if (!myPeerConnection) {
    myPeerConnection = new RTCPeerConnection(); // Get new peer connection
  }
  // createOffer is an asynchronous method that generates the local description (offer) that contains information about the local end of the connection
  const offer = await myPeerConnection.createOffer(); // creates an SDP (Session Description Protocol) offer
  await myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName2); // Emit offer to the other peer
});

// Send offer to peers
socket.on("offer", async (offer) => { // offer parameter is the SDP offer received from the other peer.
  // Check for existing peer connection
  if (!myPeerConnection) {
    myPeerConnection = new RTCPeerConnection();
  }
  await myPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await myPeerConnection.createAnswer();
  await myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName2); // Emit answer to the other peer
});

socket.on("answer", (answer) => { // Socket event listener for "answer":
  if (myPeerConnection) {
    myPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

// for Handling ICE candidates

/**
 * ICE candidates are used to find the best path for data to travel between two peers in a WebRTC connection.
 */
socket.on("ice", ice => {
  if (myPeerConnection) {
    myPeerConnection.addIceCandidate(new RTCIceCandidate(ice));
  }
});

// WebRTC connection handling
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ]
      }
    ]
  });
  if (!myStream) {
    console.error('Media stream is not available');
    return;
  }

  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("track", handleAddStream);
  
  myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

// Function to handle ICE candidate event
function handleIce(event) {
  if (event.candidate) {
    socket.emit("ice", event.candidate, roomName2); // Emit ICE candidate to the other peer
  }
}

// Function to handle adding stream event
function handleAddStream(event) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = event.streams[0]; // Set the peer's video stream
}
