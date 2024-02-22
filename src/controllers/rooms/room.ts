import { User } from '../../types/types';

export class Room {
  private gamer1: null | User;
  private gamer2: null | User;

  constructor() {
    this.gamer1 = null;
    this.gamer2 = null;
  }

  addPlayer1 = (player: User) => {
    this.gamer1 = player;
    return this.gamer1;
  };

  addPlayer2 = (player: User) => {
    this.gamer2 = player;
    return this.gamer2;
  };

  setPlayer = (player: User) => {
    const activePlayer = this.getActivePlayer();
    if (this.isFullRoom() || activePlayer?.index === player.index) {
      return;
    }

    return this.gamer1 ? this.addPlayer2(player) : this.addPlayer1(player);
  };

  isFullRoom = () => this.gamer1 && this.gamer2;

  getActivePlayer = () => this.gamer1 || this.gamer2;

  get players() {
    return {
      player1: this.gamer1,
      player2: this.gamer2,
    };
  }
}
