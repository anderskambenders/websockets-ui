import memoryDB from '../memory-database/memoryDB';
import { Request } from '../types/types';
import { GamesController } from './game/games';
import Registration from './registration';
import { RoomsService } from './rooms/rooms';
import type { WebSocket } from 'ws';

class Controller {
  private registration: Registration;
  private rooms: RoomsService;
  private games: GamesController;

  constructor(db: memoryDB) {
    this.rooms = new RoomsService(db);
    this.registration = new Registration(db, this.rooms);
    this.games = new GamesController(db);
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
      [
        'add_ships',
        (req: Request, ws: WebSocket) => this.games.addShips(req, ws),
      ],
      ['attack', (req: Request, ws: WebSocket) => this.games.attack(req, ws)],
    ];

    const res = new Map();
    routes.forEach((val) => {
      res.set(val[0], val[1]);
    });
    return res;
  };
}

export default Controller;
