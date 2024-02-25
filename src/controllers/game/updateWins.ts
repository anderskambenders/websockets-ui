import memoryDB from '../../memory-database/memoryDB';
import { HandlerReturnType } from '../../types/types';
import WebSocket from 'ws';

const updateWins = (ws: WebSocket, db: memoryDB) => {
  db.incrementUserWins(ws);
  const data: { name: string; wins: number }[] = [];
  const result: HandlerReturnType = [];
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

export default updateWins;
