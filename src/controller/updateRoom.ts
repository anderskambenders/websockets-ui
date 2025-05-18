import { wsConnections } from './utils';
import { RESPONSE_TYPE } from '../types';
import Rooms from '../model/room';
import { WebsocketResponse } from '../types';

const updateRoom = () => {
  const response: WebsocketResponse = {
    type: RESPONSE_TYPE.updateRoom,
    data: JSON.stringify(Rooms.availableRooms),
    id: 0,
  };

  wsConnections.forEach((connection) =>
    connection.ws.send(JSON.stringify(response))
  );
};

export default updateRoom;
