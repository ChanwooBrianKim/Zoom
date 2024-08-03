// socketHandlers.js
export function setupSocketHandlers(socket) {
  socket.on("welcome", (user, newCount) => {
    const h3 = document.querySelector("#room h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
  });

  socket.on("bye", (left, newCount) => {
    const h3 = document.querySelector("#room h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left ㅠㅠ`);
  });

  socket.on("new_message", addMessage);

  socket.on("room_change", (rooms) => {
    const roomList = document.querySelector("#welcome ul");
    roomList.innerHTML = '';
    rooms.forEach(room => {
      const li = document.createElement("li");
      li.innerText = room;
      roomList.append(li);
    });
  });

  socket.on("offer", async (offer) => {
    if (!myPeerConnection) {
      myPeerConnection = new RTCPeerConnection();
    }
    await myPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await myPeerConnection.createAnswer();
    await myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName2);
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
}
