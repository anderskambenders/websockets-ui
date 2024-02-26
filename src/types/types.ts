import type { WebSocket } from 'ws';

export interface Request {
  type: string;
  data: string;
  id: number;
}

export type Handler = (
  req: Request,
  ws: WebSocket
) => HandlerReturn | Promise<HandlerReturn>;

export type HandlerReturn = {
  ws: WebSocket;
  responses: Request[];
}[];

export type RegistrationData = {
  name: string;
  password: string;
};

export type RouterMap = Map<string, Handler>;

export type Routes = [string, Handler][];

export interface User extends RegistrationData {
  ws: WebSocket;
  index: number;
  wins: number;
}

export type AvailableRooms = {
  roomId: number;
  roomUsers: {
    name: string;
    index: number;
  }[];
}[];

export type ShipsRequest = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}[];

export interface AddShips {
  gameId: number;
  ships: ShipsRequest;
  indexPlayer: number;
}

export interface AttackRequest {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}
