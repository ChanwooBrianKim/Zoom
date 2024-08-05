export function setupChat(socket) {
  // Get elements from the DOM
  const welcome = document.getElementById("welcome");
  const form = welcome.querySelector("form");
  const room = document.getElementById("room");

  let roomName;

  // Hide the room section initially
  room.hidden = true;

  // Function to add a message to the chat
  function addMessage(message) {
      const ul = room.querySelector("ul");
      const li = document.createElement("li");
      li.innerText = message;
      ul.appendChild(li);
  }

  // Function to handle message submission
  function handleMessageSubmit(event) {
      event.preventDefault();
      const input = room.querySelector("#msg input");
      const value = input.value;
      socket.emit("new_message", input.value, roomName, () => {
          addMessage(`You: ${value}`);
      });
      input.value = "";
  }

  // Function to show the room interface after joining
  function showRoom() {
      welcome.hidden = true;
      room.hidden = false;
      const h3 = room.querySelector("h3");
      h3.innerText = `Room ${roomName}`;
      const msgForm = room.querySelector("#msg");
      msgForm.addEventListener("submit", handleMessageSubmit);
  }

  // Function to handle room creation or joining
  function handleRoomSubmit(event) {
      event.preventDefault();
      const input = form.querySelector("input");
      roomName = input.value;
      socket.emit("enter_room", roomName, showRoom);
      input.value = "";
  }

  form.addEventListener("submit", handleRoomSubmit);

  // Socket event handlers
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
      roomList.innerHTML = '';
      rooms.forEach(room => {
          const li = document.createElement("li");
          li.innerText = room;
          roomList.append(li);
      });
  });
}
