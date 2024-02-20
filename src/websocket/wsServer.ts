import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Controller from '../controller/Controller';

const startWebsocketServer = () => {
  const controller = new Controller();
  const server = createServer();
  const webSocketServer = new WebSocketServer({ server });
  webSocketServer.on('connection', (ws) => {
    ws.on('error', console.error);
    ws.on('message', async (data) => {
      // console.log('received: %s', data);
      try {
        const req = JSON.parse(data.toString());
        const handler = controller.getHandler(req.type);

        if (handler) {
          const resp = handler(req);
          ws.send(JSON.stringify(resp));
        } else {
          console.error('Wrong type');
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
  return server;
};

export default startWebsocketServer;
