import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const startWebsocketServer = () => {
  const server = createServer();
  const webSocketServer = new WebSocketServer({ server });
  webSocketServer.on('connection', (ws) => {
    ws.on('error', console.error);
    ws.on('message', async (data) => {
      console.log('received: %s', data);
    });
  });
  return server;
};

export default startWebsocketServer;
