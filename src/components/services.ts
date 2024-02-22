import memoryDB from '../memory-database/memoryDB';
import { Request } from '../types/types';
import Registration from './registration';
import { RoomsService } from './rooms/rooms';
import type { WebSocket } from 'ws';

export class Services {
  private registration: Registration;
  private rooms: RoomsService;

  constructor(db: memoryDB) {
    this.rooms = new RoomsService(db);
    this.registration = new Registration(db, this.rooms);
  }

  createRoutes = () => {
    const routes = [
      [
        'reg',
        (req: Request, ws: WebSocket) =>
          this.registration.registerUser(req, ws),
      ],
      [
        'create_room',
        (req: Request, ws: WebSocket) => this.rooms.createRoom(req, ws),
      ],
    ];

    const res = new Map();
    routes.forEach((val) => {
      res.set(val[0], val[1]);
    });
    return res;
  };
}
