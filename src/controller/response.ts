import Games from '../model/game';
import Rooms from '../model/room';
import {
  WebsocketRequest,
  REQUEST_TYPE,
  WebsocketResponse,
  RESPONSE_TYPE,
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
    };

    return response[request.type]({ request, name });
  } catch (error) {
    if (error instanceof TypeError)
      console.error(`${request.type} request type is not supported`);
    if (error instanceof Error) console.error(error.message);
  }
};

export default getResponse;
