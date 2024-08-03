import { setupChat } from './chat.js';
import { setupVideo } from './video.js';

// Initialise chat and video features
const socket = io();

setupChat(socket);
setupVideo(socket);
