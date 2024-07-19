const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

// Fucntion to add message 
function addMessage(message) {
  const ul = room.querySelector("ul"); // Find id #room and ul in the #room
  const li = document.createElement("li"); // Add li in the ul
  li.innerText = message;
  ul.appendChild(li); // Add message
}

// Function to handle message submission
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input"); // FInd input in the id #msg
  const value = input.value;
  // Sends a message to the server using the Socket.IO client.
  // "new_message" is the event name that the server listens for.
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  }); // addMessage executes after new message (event name), message, room name are defined
  input.value = ""; // Clearing input field
}

// Function to show rooms availabe after joining
function showRoom() {
  welcome.hidden = true; // not to show 'welcome' section
  room.hidden = false; // To show available rooms
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit); // Send message using handleMessageSubmit function
}

// Function to create room
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom); // Event name "enter_room", and show room created
  roomName = input.value;
  input.value = ""; // Clear room input section
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
