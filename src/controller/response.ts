import Games from '../model/game';
import Rooms from '../model/room';
import {
  WebsocketRequest,
  REQUEST_TYPE,
  WebsocketResponse,
  RESPONSE_TYPE,
  PlayerId,
} from '../types';
import handleAttack, { BOT_NAME } from './attack';
import getRegistrationResp from './registration';
import updateRoom from './updateRoom';
import { getWsEntryIndexByKey, wsConnections } from './utils';

const getResponse = (request: WebsocketRequest, name?: string) => {
  try {
    const response = {
      [REQUEST_TYPE.reg]: ({ request }: { request: WebsocketRequest }) =>
        getRegistrationResp(request),
      [REQUEST_TYPE.createRoom]: ({ name = '' }: { name?: string }) => {
        const isRoomCreated = Rooms.createRoom(name);
        if (isRoomCreated) updateRoom();
        else {
          const index = getWsEntryIndexByKey('userName', name);
          const response: WebsocketResponse = {
            type: RESPONSE_TYPE.updateRoom,
            data: JSON.stringify(Rooms.availableRooms),
            id: 0,
          };
          wsConnections[index].ws.send(JSON.stringify(response));
        }
      },
      [REQUEST_TYPE.addUserToRoom]: ({
        request,
        name = '',
      }: {
        request: WebsocketRequest;
        name?: string;
      }) => {
        const roomId: string = JSON.parse(request.data).indexRoom;
        const roomUsers = Rooms.addUserToRoom(roomId, name);
        updateRoom();
        if (roomUsers?.length === 2) {
          const index = Games.createGame([roomUsers[0], roomUsers[1]]);
          const players = Games.getGamePlayers(index);
          players.forEach((player) => {
            const index = getWsEntryIndexByKey('userName', player.name);
            const resp = {
              type: RESPONSE_TYPE.createGame,
              data: JSON.stringify({ index, idPlayer: player.index }),
              id: 0,
            };
            wsConnections[index].ws.send(JSON.stringify(resp));
          });
        }
      },
      [REQUEST_TYPE.addShips]: ({ request }: { request: WebsocketRequest }) => {
        const data = JSON.parse(request.data);
        const { gameId, ships, indexPlayer: playerId } = data;
        if (Games.shouldStart(gameId, ships, playerId)) {
          const players = Games.getGamePlayers(gameId);
          players.forEach((player) => {
            const response: WebsocketResponse = {
              type: RESPONSE_TYPE.startGame,
              data: JSON.stringify({
                ships: player.ships,
                currentPlayerIndex: player.index,
              }),
              id: 0,
            };
            wsConnections[
              getWsEntryIndexByKey('userName', player.name)
            ].ws.send(JSON.stringify(response));
          });
          Games.setTurn(gameId);
          const turn = Games.getTurn(gameId);
          const response: WebsocketResponse = {
            type: RESPONSE_TYPE.turn,
            data: JSON.stringify({ currentPlayer: turn }),
            id: 0,
          };
          const playersAmount = Games.getGamePlayers(gameId);
          playersAmount.forEach((player) => {
            const index = getWsEntryIndexByKey('userName', player.name);
            wsConnections[index].ws.send(JSON.stringify(response));
          });
        }
      },
      [REQUEST_TYPE.attack]: ({ request }: { request: WebsocketRequest }) => {
        const data = JSON.parse(request.data);
        const {
          gameId,
          x,
          y,
          indexPlayer,
        }: { gameId: string; x: number; y: number; indexPlayer: PlayerId } =
          data;

        if (data.indexPlayer !== Games.getTurn(gameId)) return;

        handleAttack(gameId, indexPlayer, x, y);
      },
      [REQUEST_TYPE.randomAttack]: ({
        request,
      }: {
        request: WebsocketRequest;
      }) => {
        const { gameId, indexPlayer } = JSON.parse(request.data);

        let x: number = 0;
        let y: number = 0;

        const players = Games.getGamePlayers(gameId);
        const opponentField = players[+!indexPlayer].field;

        do {
          x = Math.floor(Math.random() * 10);
          y = Math.floor(Math.random() * 10);
        } while (opponentField && opponentField[y][x].isAttacked);

        handleAttack(gameId, indexPlayer, x, y);
      },
      [REQUEST_TYPE.singlePlay]: ({ name = '' }: { name?: string }) => {
        const gameId = Games.createGame([
          { name, index: 0 },
          { name: BOT_NAME, index: 1 },
        ]);
        const ships = JSON.parse(
          '[{"position":{"x":4,"y":2},"direction":false,"type":"huge","length":4},{"position":{"x":2,"y":6},"direction":false,"type":"large","length":3},{"position":{"x":7,"y":6},"direction":true,"type":"large","length":3},{"position":{"x":3,"y":8},"direction":false,"type":"medium","length":2},{"position":{"x":0,"y":5},"direction":true,"type":"medium","length":2},{"position":{"x":0,"y":2},"direction":false,"type":"medium","length":2},{"position":{"x":8,"y":0},"direction":true,"type":"small","length":1},{"position":{"x":1,"y":0},"direction":true,"type":"small","length":1},{"position":{"x":3,"y":0},"direction":true,"type":"small","length":1},{"position":{"x":2,"y":4},"direction":true,"type":"small","length":1}]'
        );
        Games.shouldStart(gameId, ships, 1);
        const players = Games.getGamePlayers(gameId);

        players.forEach((player) => {
          if (player.name !== BOT_NAME) {
            const index = getWsEntryIndexByKey('userName', player.name);
            wsConnections[index].ws.send(
              JSON.stringify({
                type: RESPONSE_TYPE.createGame,
                data: JSON.stringify({ gameId, idPlayer: player.index }),
                id: 0,
              })
            );
          }
        });
      },
    };

    return response[request.type]({ request, name });
  } catch (error) {
    if (error instanceof TypeError)
      console.error(`${request.type} request type is not supported`);
    if (error instanceof Error) console.error(error.message);
  }
};

export default getResponse;
