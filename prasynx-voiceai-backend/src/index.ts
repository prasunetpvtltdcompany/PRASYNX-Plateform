import http from 'http';
import app from './app';
import { config } from './config';
import { createWebSocketServer } from './websocket';

const server = http.createServer(app);

const io = createWebSocketServer(server);

app.set('io', io);

server.listen(config.port, () => {
  console.log(`[VoiceAI] Prasunet AI Voice Assistant running on port ${config.port}`);
  console.log(`[WS] WebSocket server available at ws://localhost:${config.port}/ws`);
});
