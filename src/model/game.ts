import { Game, PlayerId, RoomUser, Ship } from '../types';
import crypto from 'node:crypto';

const shipShots = 20;

class Games {
  static value: Game[] = [];

  static createGame = (roomUsers: [RoomUser, RoomUser]) => {
    const index = crypto.randomUUID();

    this.value.push({
      gameId: index,
      gameUsers: [
        { name: roomUsers[0].name, index: 0 },
        { name: roomUsers[1].name, index: 1 },
      ],
    });

    return index;
  };

  static finishGame = (gameId: string) => {
    const index = this.getGameIndexById(gameId);
    if (index >= 0) this.value.splice(index, 1);
  };

  static finishGameByName = (name: string) => {
    const games = this.value.filter((game) =>
      game.gameUsers.some((user) => user.name === name)
    );
    if (games.length === 0) return null;

    const index = this.getGameIndexById(games[0].gameId);

    if (index === -1) return null;

    const gameUsers = games[index].gameUsers;
    const winner = gameUsers.filter((user) => user.name !== name)[0];

    this.value.splice(index, 1);

    return winner;
  };

  static shouldStart = (gameId: string, ships: Ship[], playerId: number) => {
    const game = this.getGameById(gameId);

    game.gameUsers[playerId].ships = ships;
    game.gameUsers[playerId].field = this.mapShipsToField(ships);
    game.gameUsers[playerId].correctShotsNum = 0;

    if (game.gameUsers.every((user) => !!user.ships)) return true;

    return false;
  };

  private static getGameIndexById = (gameId: string) => {
    return this.value.map((game) => game.gameId).indexOf(gameId);
  };

  private static getGameById = (gameId: string) => {
    return this.value[this.getGameIndexById(gameId)];
  };

  static getGamePlayers = (gameId: string) => {
    const index = this.getGameIndexById(gameId);
    return this.value[index].gameUsers;
  };

  static setTurn = (gameId: string) => {
    const game = this.getGameById(gameId);
    game.turn = Math.round(Math.random()) as PlayerId;

    return game.turn;
  };

  static getTurn = (gameId: string) => {
    return this.getGameById(gameId).turn;
  };

  static changeTurn = (gameId: string) => {
    const game = this.getGameById(gameId);
    game.turn = +!game.turn as PlayerId;
  };

  private static mapShipsToField: (
    ships: Ship[]
  ) => { value: 0 | 1; isAttacked: boolean }[][] = (ships) => {
    const field = new Array(10);
    for (let y = 0; y < 10; y += 1) {
      field[y] = new Array(10);
      for (let x = 0; x < 10; x += 1) {
        field[y][x] = { value: 0, isAttacked: false };
      }
    }

    ships.forEach((ship) => {
      const { x, y } = ship.position;

      field[y][x].value = 1;
      if (ship.direction) {
        for (let i = y; i < y + ship.length; i += 1) {
          field[i][x].value = 1;
          if (ship.length > 1 && i < y + ship.length - 1)
            field[i][x].next = { x, y: i + 1 };
          if (ship.length > 1 && i > y) field[i][x].prev = { x, y: i - 1 };
        }
      } else {
        for (let i = x; i < x + ship.length; i += 1) {
          field[y][i].value = 1;
          if (ship.length > 1 && i < x + ship.length - 1)
            field[y][i].next = { x: i + 1, y };
          if (ship.length > 1 && i > x) field[y][i].prev = { x: i - 1, y };
        }
      }
    });

    return field;
  };

  static isFinished = (gameId: string, playerId: PlayerId) => {
    const players = this.getGamePlayers(gameId);

    if (
      players[playerId].correctShotsNum &&
      players[playerId].correctShotsNum === shipShots
    )
      return true;

    return false;
  };

  static updateCorrectShotsNum = (gameId: string, playerId: PlayerId) => {
    const players = this.getGamePlayers(gameId);
    if (players[playerId].correctShotsNum !== undefined)
      players[playerId].correctShotsNum += 1;
  };
}

export default Games;
