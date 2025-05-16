import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';

const startWebSocketServer = () => {
  const server = createServer();

  const wss = new WebSocketServer({ server });
  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', async (data) => {
      try {
      } catch (e) {
        console.error(e);
      }
    });
  });

  return server;
};

export default startWebSocketServer;