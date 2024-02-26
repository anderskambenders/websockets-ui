import { WebSocket } from 'ws';
import { AddShips, AttackRequest, Handler } from '../../types/types';
import Game from './game';
import memoryDB from '../../memory-database/memoryDB';

export class GamesController {
  private id: number;
  public games: Map<number, Game>;
  private db: memoryDB;

  constructor(db: memoryDB) {
    this.games = new Map();
    this.id = 1;
    this.db = db;
  }

  get gamesId() {
    return this.id;
  }

  createGame = (
    ws1: WebSocket,
    ws2: WebSocket,
    player1Id: number,
    player2Id: number
  ) => {
    const game = new Game(this.id, player1Id, player2Id, ws1, ws2);
    const responses = game.createGameResponses();
    this.games.set(this.id++, game);
    return responses;
  };

  addShips: Handler = (req) => {
    const { gameId, indexPlayer, ships }: AddShips = JSON.parse(req.data);
    const game = this.games.get(gameId);
    return game?.setShips(indexPlayer, ships) ?? [];
  };

  attack: Handler = (req) => {
    const { gameId, indexPlayer, x, y }: AttackRequest = JSON.parse(req.data);
    const game = this.games.get(gameId);
    return game?.attack(this.db, indexPlayer, x, y) ?? [];
  };

  randomAttack: Handler = (req) => {
    const { gameId, indexPlayer } = JSON.parse(req.data);
    return (
      this.games
        .get(gameId)
        ?.attack(
          this.db,
          indexPlayer,
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10)
        ) ?? []
    );
  };
}
