import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { Request } from '../types/types';
import Controller from '../controllers/controller';
import memoryDB from '../memory-database/memoryDB';
import { handleRequest } from '../request-handler/handleRequest';
import { deleteUser } from '../request-handler/deleteUser';

const startWebSocketServer = () => {
  const server = createServer();

  const wss = new WebSocketServer({ server });
  const db = memoryDB.memoryDB;
  const services = new Controller(db);
  const controller = services.handleRequest();
  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('close', () => deleteUser(ws, db));
    ws.on('message', async (data) => {
      console.log('received: %s', data);
      try {
        const request: Request = JSON.parse(data.toString());
        const handler = handleRequest(request.type, controller);
        if (handler) {
          const WSResponses = await handler(request, ws);
          WSResponses.forEach(
            (wsWithResponse: { ws: WebSocket; responses: Request[] }) => {
              wsWithResponse.responses.forEach((response) => {
                const ws = wsWithResponse.ws;
                const stringResponse = JSON.stringify(response);
                ws.send(stringResponse, () =>
                  console.log(
                    `Command: ${response.type}, result:${stringResponse}`
                  )
                );
              });
            }
          );
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

export default startWebSocketServer;
