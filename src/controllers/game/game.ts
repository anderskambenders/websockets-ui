import { WebSocket } from 'ws';
import { Request } from '../../types/types';
import Ship from '../ships';
import { ShipsRequest } from '../../types/types';
import type { HandlerReturnType } from '../../types/types';

class Game {
  private id: number;
  private players: Map<
    number,
    {
      ws: WebSocket;
      id: number;
      ships: Ship[];
      shipsReq: ShipsRequest;
    }
  >;
  private turn: number;

  constructor(
    id: number,
    player1Id: number,
    player2Id: number,
    ws1: WebSocket,
    ws2: WebSocket
  ) {
    this.id = id;
    this.players = new Map([
      [player1Id, { ws: ws1, id: player1Id, ships: [], shipsReq: [] }],
      [player2Id, { ws: ws2, id: player2Id, ships: [], shipsReq: [] }],
    ]);
    this.turn = Math.random() > 0.5 ? player1Id : player2Id;
  }

  createGameResponses = () => {
    const ids = Array.from(this.players.keys());
    return ids.reduce<Map<number, Request>>((acc, idPlayer) => {
      const data = {
        idGame: this.id,
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

  setShips = (playerId: number, ships: ShipsRequest) => {
    const player = this.players.get(playerId);
    const createdShips = ships.map(
      (ship, index) =>
        new Ship(ship.position, ship.length, ship.direction, index)
    );
    if (player) {
      player.ships = createdShips;
      player.shipsReq = ships;
      this.players.set(player.id, player);
    }
    const players = Array.from(this.players.values());
    const canStart = players.every((player) => player.ships.length > 0);
    if (canStart) {
      return this.startGame();
    }
  };

  startGame = () => {
    const result: HandlerReturnType = [];
    this.players.forEach((player) => {
      const data = JSON.stringify({
        ships: player.shipsReq,
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

  switchTurn = () => {
    const turn = Array.from(this.players.keys()).find((id) => id !== this.turn);
    if (turn) {
      this.turn = turn;
    }
  };

  getTurnResp = () => {
    const data = JSON.stringify({
      currentPlayer: this.turn,
    });
    const response: Request = {
      type: 'turn',
      data,
      id: 0,
    };
    return response;
  };

  createAttackResponse = (
    x: number,
    y: number,
    currentPlayer: number,
    status: string
  ) => {
    const data = { position: { x, y }, currentPlayer, status };

    const attackResponse: Request = {
      type: 'attack',
      data: JSON.stringify(data),
      id: 0,
    };

    return attackResponse;
  };

  createFinishResponse = (winPlayer: number) => {
    const finishResponse: Request = {
      type: 'finish',
      data: JSON.stringify({
        winPlayer,
      }),
      id: 0,
    };

    return finishResponse;
  };

  createAttackResponses = (
    x: number,
    y: number,
    currentPlayer: number,
    status: string,
    shipId: number,
    ships: Ship[],
    shouldFinish: boolean
  ) => {
    const mainResponse = this.createAttackResponse(x, y, currentPlayer, status);
    const attackResponses: Request[] = [mainResponse];

    if (status === 'killed' && shipId >= 0) {
      const ship = ships[shipId];
      const cellsAround = ship.getCellsAround();

      cellsAround.forEach((cell) => {
        const response = this.createAttackResponse(
          cell.x,
          cell.y,
          currentPlayer,
          'miss'
        );
        attackResponses.push(response);
      });

      if (shouldFinish) {
        const finishResponse = this.createFinishResponse(currentPlayer);

        attackResponses.push(finishResponse);
      }
    }
    return attackResponses;
  };

  attack = (indexPlayer: number, x: number, y: number) => {
    const result: HandlerReturnType = [];

    if (this.turn === indexPlayer) {
      const opponentId = Array.from(this.players.keys()).find(
        (id) => id !== indexPlayer
      );

      if (opponentId) {
        const currentPlayer = this.players.get(indexPlayer);
        const opponent = this.players.get(opponentId);

        if (opponent && currentPlayer) {
          const statuses = opponent.ships.map((ship) =>
            ship.getAttackStatus(x, y)
          );
          const status = statuses.find(
            (status) => status.attackStatus !== 'miss'
          ) ?? {
            shipId: -1,
            attackStatus: 'miss',
            shipStatus: 'alive',
          };
          const shouldFinish = opponent.ships.every(
            (ship) => ship.getShipStatus() === 'killed'
          );
          const attackResponses = this.createAttackResponses(
            x,
            y,
            indexPlayer,
            status.attackStatus,
            status.shipId,
            opponent.ships,
            shouldFinish
          );
          if (status.attackStatus === 'miss') {
            this.switchTurn();
          }
          const turnResponse = this.getTurnResp();
          result.push(
            {
              ws: currentPlayer.ws,
              responses: [...attackResponses, turnResponse],
            },
            { ws: opponent.ws, responses: [...attackResponses, turnResponse] }
          );
        }
      }
    }
    return result;
  };
}

export default Game;
