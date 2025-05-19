import Games from '../model/game';
import Winners from '../model/winner';
import {
  AttackStatus,
  FieldCell,
  PlayerId,
  RESPONSE_TYPE,
  WebsocketResponse,
} from '../types';
import { getWsEntryIndexByKey, wsConnections } from './utils';

export const BOT_NAME = 'bot';

const sendAttackAllMissedResponse = (
  gameId: string,
  currentPlayer: PlayerId,
  emptyCells: { x: number; y: number }[]
) => {
  emptyCells.forEach((cell) => {
    const response: WebsocketResponse = {
      type: RESPONSE_TYPE.attack,
      data: JSON.stringify({ position: cell, currentPlayer, status: 'miss' }),
      id: 0,
    };
    const players = Games.getGamePlayers(gameId);
    players.forEach((player) => {
      if (player.name !== BOT_NAME) {
        const index = getWsEntryIndexByKey('userName', player.name);
        wsConnections[index].ws.send(JSON.stringify(response));
      }
    });
  });
};

export const sendAttackResponse = (
  gameId: string,
  position: { x: number; y: number },
  currentPlayer: PlayerId,
  status: AttackStatus
) => {
  const response: WebsocketResponse = {
    type: RESPONSE_TYPE.attack,
    data: JSON.stringify({ position, currentPlayer, status }),
    id: 0,
  };
  const players = Games.getGamePlayers(gameId);
  players.forEach((player) => {
    const index = getWsEntryIndexByKey('userName', player.name);
    wsConnections[index].ws.send(JSON.stringify(response));
  });
};

export const isShipKilled = (field: FieldCell[][], cell: FieldCell) => {
  if (!cell.next && !cell.prev) return true;

  const isShipPartShot = (
    field: FieldCell[][],
    cell: FieldCell,
    direction: 'next' | 'prev'
  ) => {
    if (cell.value === 0 || !cell.isAttacked) return false;
    if (cell.value === 1 && cell.isAttacked && !cell[direction]) return true;

    return isShipPartShot(
      field,
      field[cell[direction]!.y][cell[direction]!.x],
      direction
    );
  };

  if (cell.next && !cell.prev) {
    return isShipPartShot(field, field[cell.next.y][cell.next.x], 'next');
  } else if (!cell.next && cell.prev) {
    return isShipPartShot(field, field[cell.prev.y][cell.prev.x], 'prev');
  } else if (cell.next && cell.prev) {
    const isNextPartShot = isShipPartShot(
      field,
      field[cell.next.y][cell.next.x],
      'next'
    );
    const isPrevPartShot = isShipPartShot(
      field,
      field[cell.prev.y][cell.prev.x],
      'prev'
    );
    if (isNextPartShot && isPrevPartShot) return true;
    return false;
  }

  return false;
};

const getEmptyCells = (field: FieldCell[][], x: number, y: number) => {
  const emptyCellsSet = new Set<string>();
  const shipCells = new Set<string>();

  const fillEmptyCellsSet = (field: FieldCell[][], x: number, y: number) => {
    for (let i = y - 1; i <= y + 1; i += 1) {
      for (let j = x - 1; j <= x + 1; j += 1) {
        if (i >= 0 && i <= 9 && j >= 0 && j <= 9) {
          if (field[i][j].value === 0) emptyCellsSet.add(`${j},${i}`);
          else if (field[i][j].value === 1 && !shipCells.has(`${j},${i}`)) {
            shipCells.add(`${j},${i}`);

            fillEmptyCellsSet(field, j, i);
          }
        }
      }
    }
  };

  fillEmptyCellsSet(field, x, y);

  let emptyCells = Array.from(emptyCellsSet);

  return emptyCells.map((str) => ({
    x: +str.split(',')[0],
    y: +str.split(',')[1],
  }));
};

const handleAttack = (
  gameId: string,
  indexPlayer: PlayerId,
  x: number,
  y: number
) => {
  const players = Games.getGamePlayers(gameId);

  const opponentField = players[+!indexPlayer].field;
  if (!opponentField) return;
  let status: AttackStatus = 'miss';
  const cell = opponentField[y][x];

  if (cell.value === 1) {
    if (isShipKilled(opponentField, cell)) status = 'killed';
    else status = 'shot';

    if (cell.isAttacked === false) {
      Games.updateCorrectShotsNum(gameId, indexPlayer);
    }
  }
  cell.isAttacked = true;

  sendAttackResponse(gameId, { x, y }, indexPlayer, status);

  if (status === 'killed') {
    const emptyCells = getEmptyCells(opponentField, x, y);
    emptyCells.forEach(
      (cell) => (opponentField[cell.y][cell.x].isAttacked = true)
    );

    sendAttackAllMissedResponse(gameId, indexPlayer, emptyCells);
  } else if (status === 'miss') Games.changeTurn(gameId);

  if (
    players[indexPlayer].name === BOT_NAME &&
    (status === 'shot' || status === 'killed')
  )
    fireBotAttack();

  if (Games.isFinished(gameId, indexPlayer)) {
    if (players[indexPlayer].name !== BOT_NAME) {
      Winners.updateTable(players[indexPlayer].name);
      const response: WebsocketResponse = {
        type: RESPONSE_TYPE.updataWinners,
        data: JSON.stringify(Winners.table),
        id: 0,
      };

      wsConnections.forEach((connection) =>
        connection.ws.send(JSON.stringify(response))
      );
    }
    const response: WebsocketResponse = {
      type: RESPONSE_TYPE.finishGame,
      data: JSON.stringify({ winPlayer: indexPlayer }),
      id: 0,
    };

    players.forEach((player) => {
      if (player.name !== BOT_NAME) {
        const index = getWsEntryIndexByKey('userName', player.name);
        wsConnections[index].ws.send(JSON.stringify(response));
      }
    });
    // sendFinishGameResponse(gameId, indexPlayer);
    Games.finishGame(gameId);
    return;
  }

  const turn = Games.getTurn(gameId);

  const response: WebsocketResponse = {
    type: RESPONSE_TYPE.turn,
    data: JSON.stringify({ currentPlayer: turn }),
    id: 0,
  };
  players.forEach((player) => {
    if (player.name !== BOT_NAME) {
      const index = getWsEntryIndexByKey('userName', player.name);
      wsConnections[index].ws.send(JSON.stringify(response));
    }
  });

  function fireBotAttack() {
    const opponentField = players[0].field;
    let x = 0;
    let y = 0;
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
    } while (opponentField && opponentField[y][x].isAttacked);

    handleAttack(gameId, 1, x, y);
  }

  if (
    players[+!indexPlayer].name === BOT_NAME &&
    indexPlayer !== Games.getTurn(gameId)
  ) {
    fireBotAttack();
  }
};

export default handleAttack;
