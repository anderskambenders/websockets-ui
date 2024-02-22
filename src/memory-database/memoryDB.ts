import { RegistrationData, User } from '../types/types';
import type { WebSocket } from 'ws';

class memoryDB {
  private static instance: memoryDB;
  private db: Map<WebSocket, User>;
  private userIndex: number;

  private constructor() {
    this.db = new Map();
    this.userIndex = 1;
  }

  getUser = (ws: WebSocket) => {
    return this.db.get(ws);
  };

  addUser = (ws: WebSocket, { name, password }: RegistrationData) => {
    const user = { name, password, index: this.userIndex++, ws, wins: 0 };
    this.db.set(ws, user);
    return user.index;
  };

  deleteUser = (ws: WebSocket) => {
    this.db.delete(ws);
  };

  getAllWS = () => {
    return this.db.keys();
  };

  getAllUsers = () => {
    return this.db.values();
  };

  static get memoryDB() {
    if (!memoryDB.instance) {
      memoryDB.instance = new memoryDB();
    }

    return memoryDB.instance;
  }
}

export default memoryDB;
