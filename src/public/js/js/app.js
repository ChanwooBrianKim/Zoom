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
let muted = false;
let cameraOff = false;
let roomName2;

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
  if (!myStream) {
    console.error('Media stream is not available');
    return;
  }
  
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    camerasSelect.innerHTML = ''; // Clear existing options
    cameras.forEach(camera => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera && currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.error('Error getting cameras:', e);
  }
}

// Function to get media stream
async function getMedia(deviceId) {
  const constraints = {
    audio: true,
    video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }
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
  if (!myStream) return;

  myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
  muteBtn.innerText = muted ? "Mute" : "Unmute";
  muted = !muted;
}

// Function to handle camera button click
function handleCameraClick() {
  if (!myStream) return;

  myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
  cameraBtn.innerText = cameraOff ? "Turn Camera Off" : "Turn Camera On";
  cameraOff = !cameraOff;
}

// Function to handle camera selection change
async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if(myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find(sender => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
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
    myPeerConnection = new RTCPeerConnection();
  }
  const offer = await myPeerConnection.createOffer();
  await myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName2); // Emit offer to the other peer
});

socket.on("offer", async (offer) => {
  if (!myPeerConnection) {
    myPeerConnection = new RTCPeerConnection();
  }
  await myPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await myPeerConnection.createAnswer();
  await myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName2); // Emit answer to the other peer
});

socket.on("answer", (answer) => {
  if (myPeerConnection) {
    myPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

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
