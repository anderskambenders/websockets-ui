import { RequestData } from '../types/types';

class memoryDB {
  private _db: Array<RequestData>;

  constructor() {
    this._db = [];
  }

  get users() {
    return this._db;
  }

  addUser = ({ name, password }: RequestData) => {
    const user = { name, password };
    this._db.push(user);
    return this._db.findIndex((val) => val === user);
  };
}

export default memoryDB;
