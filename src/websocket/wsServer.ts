import WebSocket, { WebSocketServer } from 'ws';
import crypto from 'node:crypto';
import {
  REQUEST_TYPE,
  RESPONSE_TYPE,
  WebsocketRequest,
  WebsocketResponse,
} from '../types';
import { BOT_NAME } from '../controller/attack';
import getResponse from '../controller/response';
import { getWsEntryIndexByKey, wsConnections } from '../controller/utils';
import Users from '../model/user';
import Rooms from '../model/room';
import Winners from '../model/winner';
import Games from '../model/game';

const runWsServer = (port: number) => {
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

          if (userName === BOT_NAME) {
            error = true;
            errorText = 'This name is reserved. Please use another one';
          } else if (
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

        let response = getResponse(request, name);
        if (response as unknown as WebsocketResponse) {
          ws.send(JSON.stringify(response));
          if (
            (response as unknown as WebsocketResponse).type === REQUEST_TYPE.reg
          ) {
            wsConnections.forEach((connection) =>
              connection.ws.send(
                JSON.stringify({
                  type: RESPONSE_TYPE.updateRoom,
                  data: JSON.stringify(Rooms.availableRooms),
                  id: 0,
                })
              )
            );
            const response: WebsocketResponse = {
              type: RESPONSE_TYPE.updataWinners,
              data: JSON.stringify(Winners.table),
              id: 0,
            };

            wsConnections.forEach((connection) =>
              connection.ws.send(JSON.stringify(response))
            );
          }
        }
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
      }
    });

    ws.on('close', () => {
      const index = getWsEntryIndexByKey('connectionId', connectionId);
      if (index === -1) return;
      const name = wsConnections[index].userName;
      const isRemoved = Rooms.removeUserFromRooms(name);
      if (isRemoved) {
        const response: WebsocketResponse = {
          type: RESPONSE_TYPE.updateRoom,
          data: JSON.stringify(Rooms.availableRooms),
          id: 0,
        };

        wsConnections.forEach((connection) =>
          connection.ws.send(JSON.stringify(response))
        );
      }
      const winner = Games.finishGameByName(name);
      if (winner && winner.name !== BOT_NAME) {
        Winners.updateTable(winner.name);
        const response = {
          type: RESPONSE_TYPE.finishGame,
          data: JSON.stringify({ winPlayer: winner.index }),
          id: 0,
        };
        wsConnections[getWsEntryIndexByKey('userName', winner.name)].ws.send(
          JSON.stringify(response)
        );
        const responseWin: WebsocketResponse = {
          type: RESPONSE_TYPE.updataWinners,
          data: JSON.stringify(Winners.table),
          id: 0,
        };

        wsConnections.forEach((connection) =>
          connection.ws.send(JSON.stringify(responseWin))
        );
      }

      wsConnections.splice(index, 1);
    });
  });
};

export default runWsServer;
