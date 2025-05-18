import { Winner } from '../types';

class Winners {
  static table: Winner[] = [];

  static updateTable = (name: string) => {
    const index = this.table.map((winner) => winner.name).indexOf(name);

    if (index >= 0) {
      this.table[index].wins += 1;
    } else {
      this.table.push({ name, wins: 1 });
    }
  };
}

export default Winners;
