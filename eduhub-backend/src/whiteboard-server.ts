import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

// Map to store sessions and their connected clients
const sessions = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket, request) => {
  const { query } = parse(request.url || '', true);
  const sessionId = query.session as string;

  if (!sessionId) {
    console.log('Connection rejected: No session ID provided');
    ws.close(1008, 'Session ID required');
    return;
  }

  console.log(`[WhiteboardSync] Client connected to session: ${sessionId}`);

  // Add client to session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new Set());
  }
  sessions.get(sessionId)!.add(ws);

  ws.on('message', (message: string) => {
    // Broadcast message to all other clients in the same session
    const clients = sessions.get(sessionId);
    if (clients) {
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`[WhiteboardSync] Client disconnected from session: ${sessionId}`);
    const clients = sessions.get(sessionId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        sessions.delete(sessionId);
      }
    }
  });

  ws.on('error', (error) => {
    console.error(`[WhiteboardSync] WebSocket error in session ${sessionId}:`, error);
  });
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url || '');

  if (pathname === '/api/whiteboard/sync') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Whiteboard Sync Server running on port ${PORT}`);
  console.log(`   Endpoint: ws://localhost:${PORT}/api/whiteboard/sync`);
});
