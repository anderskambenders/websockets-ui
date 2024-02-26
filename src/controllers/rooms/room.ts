import { User } from '../../types/types';

class Room {
  private gamers: [null | User, null | User];

  constructor() {
    this.gamers = [null, null];
  }

  addPlayer(index: number, player: User) {
    if (this.isFullRoom() || this.gamers[index]) {
      return null;
    }
    this.gamers[index] = player;
    return this.gamers[index];
  }

  setPlayer(player: User) {
    const activePlayer = this.getActivePlayer();
    if (this.isFullRoom() || activePlayer?.index === player.index) {
      return null;
    }

    const index = this.gamers[0] ? 1 : 0;
    return this.addPlayer(index, player);
  }

  isFullRoom() {
    return this.gamers[0] && this.gamers[1];
  }

  getActivePlayer() {
    return this.gamers[0] || this.gamers[1];
  }

  get players() {
    return {
      player1: this.gamers[0],
      player2: this.gamers[1],
    };
  }
}

export default Room;
