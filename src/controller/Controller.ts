import { Services } from '../components/services';
import { RequestResponse } from '../types/types';

interface Routes {
  reg: (req: RequestResponse) => RequestResponse;
}

class Controller {
  private _services;

  constructor() {
    this._services = new Services();
  }

  getHandler = (type: keyof Routes) => {
    return this._services.routes[type];
  };
}

export default Controller;
