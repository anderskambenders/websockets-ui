import memoryDB from '../../memory-database/memoryDB';
import { Room } from './room';
import { Request } from '../../types/types';
import type {
  AvailableRooms,
  Handler,
  HandlerReturnType,
} from '../../types/types';
import type { WebSocket } from 'ws';

export class RoomsService {
  private _rooms: Map<number, Room>;
  private _roomId: number;
  private db: memoryDB;

  constructor(db: memoryDB) {
    this.db = db;
    this._rooms = new Map();
    this._roomId = 1;
  }

  createRoom: Handler = (_, ws) => {
    const webSockets = this.db.getAllWS();
    this.addRoom(ws);
    const updatedRoom = this.updateRoom();
    const responses = [updatedRoom];
    const result: HandlerReturnType = [];

    for (const ws of webSockets) {
      result.push({ ws, responses });
    }

    return result;
  };

  addRoom = (ws: WebSocket) => {
    const room = new Room();
    const player1 = this.db.getUser(ws);

    if (player1) {
      room.addPlayer1(player1);
    }

    this._rooms.set(this._roomId++, room);
  };

  updateRoom = () => {
    const data: AvailableRooms = [];

    this._rooms.forEach((room, id) => {
      const isFull = room.isFullRoom();
      const player = room.getActivePlayer();

      if (!isFull && player) {
        const dataItem = {
          roomId: id,
          roomUsers: [
            {
              name: player.name,
              index: player.index,
            },
          ],
        };
        data.push(dataItem);
      }
    });

    const result: Request = {
      type: 'update_room',
      data: JSON.stringify(data),
      id: 0,
    };

    return result;
  };

  getSize = () => {
    return this._rooms.size;
  };
}
