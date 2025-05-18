import Games from '../model/game';
import Rooms from '../model/room';
import {
  WebsocketRequest,
  REQUEST_TYPE,
  WebsocketResponse,
  RESPONSE_TYPE,
  PlayerId,
} from '../types';
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
    };

    return response[request.type]({ request, name });
  } catch (error) {
    if (error instanceof TypeError)
      console.error(`${request.type} request type is not supported`);
    if (error instanceof Error) console.error(error.message);
  }
};

export default getResponse;
