import { WebSocket } from 'ws';
import { Request } from '../../types/types';
import Ship from '../ships';
import { ShipsRequest } from '../../types/types';
import type { HandlerReturnType } from '../../types/types';

export class GameService {
  private _id: number;
  private _players: Map<
    number,
    {
      ws: WebSocket;
      id: number;
      ships: Ship[];
      shipsRes: ShipsRequest;
    }
  >;
  private _turn: number;

  constructor(
    id: number,
    player1Id: number,
    player2Id: number,
    ws1: WebSocket,
    ws2: WebSocket
  ) {
    this._id = id;
    this._players = new Map([
      [player1Id, { ws: ws1, id: player1Id, ships: [], shipsResponse: [] }],
      [player2Id, { ws: ws2, id: player2Id, ships: [], shipsResponse: [] }],
    ]);
    this._turn = this.randomFirstMove();
  }

  createGameResponses = () => {
    const ids = Array.from(this._players.keys());

    return ids.reduce<Map<number, Request>>((acc, idPlayer) => {
      const data = {
        idGame: this._id,
        idPlayer,
      };

      acc.set(idPlayer, {
        type: 'create_game',
        data: JSON.stringify(data),
        id: 0,
      });

      return acc;
    }, new Map());
  };

  getAllPlayers = () => {
    return Array.from(this._players.values());
  };

  getAllPlayersIds = () => {
    return Array.from(this._players.keys());
  };

  setShips = (playerId: number, ships: ShipsRequest) => {
    const player = this._players.get(playerId);
    const createdShips = ships.map(
      (ship, ind) => new Ship(ship.position, ship.length, ship.direction, ind)
    );

    if (player) {
      player.ships = createdShips;
      player.shipsRes = ships;
      this._players.set(player.id, player);
    }

    const players = this.getAllPlayers();
    if (players.every((player) => player.ships.length > 0)) {
      return this.startGame();
    }
  };

  startGame = () => {
    const result: HandlerReturnType = [];

    this._players.forEach((player) => {
      const data = JSON.stringify({
        ships: player.shipsRes,
        currentPlayerIndex: player.id,
      });
      const startResponse: Request = {
        type: 'start_game',
        data,
        id: 0,
      };
      const turnResponse = this.getTurnResp();
      const responses = [startResponse, turnResponse];
      result.push({ ws: player.ws, responses });
    });

    return result;
  };
}
