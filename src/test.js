// Function to handle screen sharing
async function handleScreenShare() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    });

    const screenTrack = screenStream.getVideoTracks()[0];
    const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");

    if (!videoSender) {
      console.error("Video sender not found. Ensure the peer connection is properly set up and the video track is added.");
      return;
    }

    videoSender.replaceTrack(screenTrack);

    screenTrack.onended = async () => {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      videoSender.replaceTrack(cameraTrack);
    };

  } catch (e) {
    console.error("Error sharing screen:", e);
  }
}