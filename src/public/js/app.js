import { setupChat } from './chat.js';
import { setupVideo } from './video.js';
import { setupFileSharing } from './fileSharing.js';

// // Initialise chat and video features
// const socket = io();

const token = localStorage.getItem('token'); // Retrieve the token from local storage

if (!token) {
    // Redirect to login page or handle the case where the user is not authenticated
    window.location.href = '/login';
  } else {
    const socket = io({
      auth: {
        token: token
      }
    });
  
    setupChat(socket);
    setupVideo(socket);
    setupFileSharing(socket);
  }