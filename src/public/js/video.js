export function setupVideo(socket) {
    // Get elements from the DOM
    const myFace = document.getElementById("myFace");
    const muteBtn = document.getElementById("mute");
    const cameraBtn = document.getElementById("camera");
    const camerasSelect = document.getElementById("cameras");
    const call = document.getElementById("call");
    const shareScreenBtn = document.getElementById("shareScreen");

    call.hidden = true; // Hide video call section initially

    let myStream;
    let myPeerConnection;
    let muted = false; 
    let cameraOff = false; 
    let roomName2; 

    // Function to get list of cameras
    async function getCameras() {
        if (!myStream) {
        console.error('Media stream is not available');
        return;
        }
        
        try {
        const devices = await navigator.mediaDevices.enumerateDevices(); // Get a list of all media devices (audio and video)
        const cameras = devices.filter(device => device.kind === "videoinput"); // Filter out the video input devices (cameras)
        const currentCamera = myStream.getVideoTracks()[0]; // Get the currently active video track
        camerasSelect.innerHTML = ''; // Clear existing options
        cameras.forEach(camera => {
            const option = document.createElement("option"); // Create option element
            option.value = camera.deviceId; // Set the value to the camera's device ID
            option.innerText = camera.label; // Set the text to the camera's label
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
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
        }
    }

    // Function to handle screen sharing
    async function handleScreenShare() {
        try {
        // Requests access to capture the user's screen
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ // prompts the user to select a screen, window, or tab to share
            video: true
        });
        // Extracts the video track from the screenStream
        const screenTrack = screenStream.getVideoTracks()[0]; // screenTrack is the video track that captures the screen
        // Finds the sender in the peer connection that is responsible for sending the video track.
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video"); // filters this list to find the sender that is sending a video track
        videoSender.replaceTrack(screenTrack); // The peer connection now sends the screen capture instead of the camera feed
    
        // Triggered when the user stops screen sharing
        screenTrack.onended = async () => {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true }); // called again to access the user's camera
            const cameraTrack = cameraStream.getVideoTracks()[0]; // extracts the video track from the camera stream again
            videoSender.replaceTrack(cameraTrack); // replaces the screen capture track with the original camera track in the peer connection
        };
        /*
        User denies screen sharing permission.
        Issues with accessing media devices.
        Problems with replacing the track in the peer connection
        */
        } catch (e) {
            console.error("Error sharing screen:", e);
        }
    } 

    muteBtn.addEventListener("click", handleMuteClick);
    cameraBtn.addEventListener("click", handleCameraClick);
    camerasSelect.addEventListener("input", handleCameraChange);
    shareScreenBtn.addEventListener("click", handleScreenShare);

    // Welcome Form (join a room)
    const welcome2 = document.getElementById("welcome2");
    const welcomeForm = welcome2.querySelector("#callForm");

    // Function to initialie the call
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
        const offer = await myPeerConnection.createOffer();
        await myPeerConnection.setLocalDescription(offer);
        socket.emit("offer", offer, roomName2); // Emit offer to the other peer
    });
    // Send offer to peers
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
  
}