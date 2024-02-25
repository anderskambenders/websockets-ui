import memoryDB from '../../memory-database/memoryDB';
import Room from './room';
import { Request } from '../../types/types';
import type {
  AvailableRooms,
  Handler,
  HandlerReturnType,
} from '../../types/types';
import { GamesController } from '../game/games';

export class Rooms {
  private rooms: Map<number, Room>;
  private roomId: number;
  private games: GamesController;
  private db: memoryDB;

  constructor(db: memoryDB, games: GamesController) {
    this.db = db;
    this.rooms = new Map();
    this.roomId = 1;
    this.games = games;
  }

  createRoom: Handler = (_, ws) => {
    const webSockets = this.db.getAllWS();
    const room = new Room();
    const player1 = this.db.getUser(ws);
    if (player1) {
      room.addPlayer(0, player1);
    }
    this.rooms.set(this.roomId++, room);
    const updatedRoom = this.updateRoom();
    const responses = [updatedRoom];
    const result: HandlerReturnType = [];

    for (const ws of webSockets) {
      result.push({ ws, responses });
    }

    return result;
  };

  addUserToRoom: Handler = (req, ws) => {
    const { indexRoom }: { indexRoom: number } = JSON.parse(req.data);
    const user = this.db.getUser(ws);
    const room = this.rooms.get(indexRoom);
    const result: HandlerReturnType = [];
    if (room && user) {
      room.setPlayer(user);
      const { player1, player2 } = room.players;
      if (player1 && player2) {
        const gameResp = this.games.createGame(
          player1.ws,
          player2.ws,
          player1.index,
          player2.index
        );
        const player1Resp = gameResp.get(player1.index);
        const player2Resp = gameResp.get(player2.index);
        if (player1Resp && player2Resp) {
          const updateResp = this.updateRoom();
          result.push({ ws: player1.ws, responses: [player1Resp, updateResp] });
          result.push({ ws: player2.ws, responses: [player2Resp, updateResp] });
        }
      }
    }

    return result;
  };

  updateRoom = () => {
    const data: AvailableRooms = [];
    this.rooms.forEach((room, id) => {
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

  get size() {
    return this.rooms.size;
  }
}

export default Rooms;
