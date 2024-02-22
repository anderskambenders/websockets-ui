import { RouterMap } from '../types/types';

export const handleRequest = (type: string, controller: RouterMap) => {
  return controller.get(type);
};
