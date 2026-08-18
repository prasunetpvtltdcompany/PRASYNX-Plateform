import http from 'http';
import { config } from './config';
import app from './app';
import { createWebSocketServer } from './voiceai/websocket';

const server = http.createServer(app);

// VoiceAI WebSocket (Socket.IO) — mounted on the shared HTTP server at /ws
const io = createWebSocketServer(server);
app.set('io', io);

server.listen(config.port, () => {
  console.log(`Platform API v2 running on http://localhost:${config.port}`);
  console.log('  Management portal (core monolith — src/management):');
  console.log(`    /api/v2            refactored CRUD + feature routes`);
  console.log(`    /api/management    legacy management compatibility routes`);
  console.log(`    /api/v2/auth       auth`);
  console.log('  Admin portal (src/admin):');
  console.log(`    /api/v2/admin      admin, analytics, global command center, billing, user mgmt`);
  console.log('  Job Provider portal (src/jobprovider):');
  console.log(`    /api/job-provider  job provider routes`);
  console.log('  VoiceAI portal (src/voiceai):');
  console.log(`    /api/voice         voice assistant routes`);
  console.log(`    ws://localhost:${config.port}/ws   Socket.IO`);
  console.log('  Parent portal (src/parent):');
  console.log(`    /api/v2/parents/auth  auth`);
  console.log(`    /api/v2/parents       refactored routes`);
  console.log(`    /api/parents          legacy routes`);
  console.log('  Staff portal (src/staff):');
  console.log(`    /api/v2/staff/auth  auth`);
  console.log(`    /api/staff          refactored routes`);
  console.log('  Student portal (src/student):');
  console.log(`    /api/v2/student/auth  auth`);
  console.log(`    /api/v2/student       refactored routes`);
  console.log(`    /api/student          legacy routes`);
});
