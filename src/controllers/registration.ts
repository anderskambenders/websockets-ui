import memoryDB from '../memory-database/memoryDB';
import { Request } from '../types/types';
import { RegistrationData } from '../types/types';
import type { Rooms } from './rooms/rooms';
import type { WebSocket } from 'ws';
import { winsResp } from './game/updateWins';

class Registration {
  private db: memoryDB;
  private rooms: Rooms;

  constructor(db: memoryDB, rooms: Rooms) {
    this.db = db;
    this.rooms = rooms;
  }

  isValidUser = ({ name, password }: RegistrationData) => {
    const users = Array.from(this.db.getAllUsers());
    const user = users.find((user) => user.name === name);
    return user ? user.password === password : true;
  };

  registerUser = (req: Request, ws: WebSocket) => {
    const user = this.createUser(req, ws);
    const responses: Request[] = [user];
    const size = this.rooms.size;
    if (size) {
      responses.push(this.rooms.updateRoom());
    }
    const updateWinners = winsResp(this.db);

    const result = [{ ws, responses }, ...updateWinners];
    return result;
  };

  createUser = ({ type, data, id }: Request, ws: WebSocket) => {
    const userData: RegistrationData = JSON.parse(data);
    const responseData = {
      name: userData.name,
      index: this.isValidUser(userData) ? this.db.addUser(ws, userData) : -1,
      error: !this.isValidUser(userData),
      errorText: this.isValidUser(userData)
        ? ''
        : 'User already exist. Invalid password',
    };
    return {
      type,
      id,
      data: JSON.stringify(responseData),
    };
  };
}

export default Registration;
