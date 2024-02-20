import memoryDB from '../memory-database/memoryDB';
import { RequestResponse } from '../types/types';
import { RequestData } from '../types/types';

export class RegService {
  db: memoryDB;

  constructor(db: memoryDB) {
    this.db = db;
  }

  isValidUser = ({ name, password }: { name: string; password: string }) => {
    const user = this.db.users.find((user) => user.name === name);
    return user?.password === password;
  };

  createUser = ({ type, data, id }: RequestResponse) => {
    const userData: RequestData = JSON.parse(data);
    const index = this.db.addUser(userData);
    const resData = {
      name: userData.name,
      index,
      error: false,
      errorText: '',
    };
    const response: RequestResponse = {
      type,
      id,
      data: JSON.stringify(resData),
    };
    return response;
  };
}
