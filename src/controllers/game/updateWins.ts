import memoryDB from '../../memory-database/memoryDB';
import { HandlerReturn } from '../../types/types';
import WebSocket from 'ws';

export const winsResp = (db: memoryDB) => {
  const data: { name: string; wins: number }[] = [];
  const result: HandlerReturn = [];
  const webSockets = Array.from(db.getAllWS());
  webSockets.forEach((ws) => {
    const user = db.getUser(ws);
    if (user) {
      data.push({ name: user.name, wins: user.wins });
    }
  });
  const response = {
    type: 'update_winners',
    data: JSON.stringify(data),
    id: 0,
  };
  webSockets.forEach((ws) => {
    result.push({ ws, responses: [response] });
  });
  return result;
};

export const updateWins = (ws: WebSocket, db: memoryDB) => {
  db.incrementUserWins(ws);
  return winsResp(db);
};
