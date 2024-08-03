export function setupChat (socket) {
    // Get elements from the DOM
    const welcome = document.getElementById("welcome");
    const form = welcome.querySelector("form");
    const room = document.getElementById("room");

    let roomName;

    // Hide the room section initially
    room.hidden = true;

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
}