import memoryDB from '../memory-database/memoryDB';
import { RegService } from './registration';
import { RequestResponse } from '../types/types';

export class Services {
  db;
  reg;
  routes;

  constructor() {
    this.db = new memoryDB();
    this.reg = new RegService(this.db);
    this.routes = {
      reg: (req: RequestResponse) => this.reg.createUser(req),
    };
  }
}
