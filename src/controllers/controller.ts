import memoryDB from '../memory-database/memoryDB';
import { Request } from '../types/types';
import { GamesController } from './game/games';
import Registration from './registration';
import Rooms from './rooms/rooms';
import type { WebSocket } from 'ws';

class Controller {
  private registration: Registration;
  private rooms: Rooms;
  private games: GamesController;

  constructor(db: memoryDB) {
    this.games = new GamesController(db);
    this.rooms = new Rooms(db, this.games);
    this.registration = new Registration(db, this.rooms);
  }

  handleRequest = () => {
    const routes = [
      [
        'reg',
        (request: Request, ws: WebSocket) =>
          this.registration.registerUser(request, ws),
      ],
      [
        'create_room',
        (request: Request, ws: WebSocket) => this.rooms.createRoom(request, ws),
      ],
      [
        'add_ships',
        (request: Request, ws: WebSocket) => this.games.addShips(request, ws),
      ],
      [
        'add_user_to_room',
        (request: Request, ws: WebSocket) =>
          this.rooms.addUserToRoom(request, ws),
      ],
      [
        'attack',
        (request: Request, ws: WebSocket) => this.games.attack(request, ws),
      ],
      [
        'add_ships',
        (request: Request, ws: WebSocket) => this.games.addShips(request, ws),
      ],
    ];

    const res = new Map();
    routes.forEach((val) => {
      res.set(val[0], val[1]);
    });
    return res;
  };
}

export default Controller;
