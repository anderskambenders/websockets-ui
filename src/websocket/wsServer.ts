import WebSocket, { WebSocketServer } from 'ws';
import {
  REQUEST_TYPE,
  RESPONSE_TYPE,
  WebsocketRequest,
  WebsocketResponse,
} from '../types';
import Users from '../model/user';
import getResponse from '../controller/response';
import { getWsEntryIndexByKey, wsConnections } from '../controller/utils';

const startWebsocketServer = (port: number) => {
  const wsServer = new WebSocketServer({ port });
  console.log(`Start web socket server on the ${port} port!`);

  wsServer.on('connection', (ws: WebSocket) => {
    const connectionId = crypto.randomUUID();
    ws.on('message', (msg) => {
      try {
        const request: WebsocketRequest = JSON.parse(msg.toString());
        console.log(request.type);

        if (request.type === REQUEST_TYPE.reg) {
          const {
            name: userName,
            password,
          }: { name: string; password: string } = JSON.parse(request.data);
          const wsIndex = getWsEntryIndexByKey('userName', userName);
          const userIndex = Users.getUserIndex(userName);

          let error = false;
          let errorText = '';

          if (
            userIndex !== -1 &&
            Users.value[userIndex].password !== password
          ) {
            error = true;
            errorText = 'Invalid password';
          } else if (wsIndex >= 0) {
            error = true;
            errorText = `User ${userName} is already logged in`;
          }

          if (error) {
            const response: WebsocketResponse = {
              type: RESPONSE_TYPE.reg,
              data: JSON.stringify({
                name: userName,
                index: -1,
                error,
                errorText,
              }),
              id: 0,
            };
            ws.send(JSON.stringify(response));
          } else wsConnections.push({ connectionId, userName, ws });
        }

        const index = getWsEntryIndexByKey('connectionId', connectionId);
        if (index === -1) return;

        const name = wsConnections[index].userName;

        let response: void | WebsocketResponse = getResponse(request, name);
        if (response as unknown as WebsocketResponse) {
          ws.send(JSON.stringify(response));
          if (
            (response as unknown as WebsocketResponse).type === REQUEST_TYPE.reg
          ) {
          }
        }
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
      }
    });

    ws.on('close', () => {});
  });
};

export default startWebsocketServer;
