import memoryDB from '../memory-database/memoryDB';
import type { WebSocket } from 'ws';

export const deleteUser = (ws: WebSocket, db: memoryDB) => {
  db.deleteUser(ws);
};
