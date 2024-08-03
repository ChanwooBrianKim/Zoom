import { setupChat } from './chat.js';
import { setupVideo } from './video.js';
import { setupFileSharing } from './fileSharing.js';

// Initialise chat and video features
const socket = io();

setupChat(socket);
setupVideo(socket);
setupFileSharing(socket);
