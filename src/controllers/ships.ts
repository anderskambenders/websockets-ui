class Ship {
  private hp: number;
  private position: { x: number; y: number };
  private coordinates: { x: number; y: number }[];
  private direction: boolean;
  private status: 'alive' | 'killed';
  private shipId: number;

  constructor(
    pos: { x: number; y: number },
    length: number,
    direction: boolean,
    shipId: number
  ) {
    this.position = pos;
    this.coordinates = this.calculateCoordinates(length, direction);
    this.hp = this.coordinates.length;
    this.direction = direction;
    this.status = 'alive';
    this.shipId = shipId;
  }

  private calculateCoordinates(
    length: number,
    direction: boolean
  ): { x: number; y: number }[] {
    const coordinates: { x: number; y: number }[] = [];
    const { x, y } = this.position;

    for (let i = 0; i < length; i++) {
      const coordinate = direction ? { x, y: y + i } : { x: x + i, y };
      coordinates.push(coordinate);
    }

    return coordinates;
  }

  public getCellsAround(): { x: number; y: number }[] {
    const cells: { x: number; y: number }[] = [];
    const maxX = 9;
    const maxY = 9;

    for (const coordinate of this.coordinates) {
      const { x, y } = coordinate;

      if (this.direction) {
        if (y > 0) {
          cells.push({ x: x - 1, y: y - 1 });
          cells.push({ x, y: y - 1 });
          cells.push({ x: x + 1, y: y - 1 });
        }

        if (y < maxY) {
          cells.push({ x: x - 1, y: y + 1 });
          cells.push({ x, y: y + 1 });
          cells.push({ x: x + 1, y: y + 1 });
        }

        if (x > 0) {
          cells.push({ x: x - 1, y });
        }

        if (x < maxX) {
          cells.push({ x: x + 1, y });
        }
      } else {
        if (x > 0) {
          cells.push({ x: x - 1, y: y - 1 });
          cells.push({ x: x - 1, y });
          cells.push({ x: x - 1, y: y + 1 });
        }

        if (x < maxX) {
          cells.push({ x: x + 1, y: y - 1 });
          cells.push({ x: x + 1, y });
          cells.push({ x: x + 1, y: y + 1 });
        }

        if (y > 0) {
          cells.push({ x, y: y - 1 });
        }

        if (y < maxY) {
          cells.push({ x, y: y + 1 });
        }
      }
    }

    return cells;
  }

  public decreaseHp(): void {
    this.hp--;
  }

  public isShipStrike(x: number, y: number): boolean {
    return this.coordinates.some(
      (coordinate) => coordinate.x === x && coordinate.y === y
    );
  }

  public getAttackStatus(
    x: number,
    y: number
  ): { shipId: number; attackStatus: string; shipStatus: string } {
    const isStrike = this.isShipStrike(x, y);
    const status = {
      shipId: this.shipId,
      attackStatus: 'miss',
      shipStatus: this.status,
    };

    if (isStrike) {
      this.decreaseHp();

      if (this.hp) {
        status.attackStatus = 'shot';
      } else {
        this.status = status.shipStatus = status.attackStatus = 'killed';
      }
    }

    return status;
  }

  public getShipStatus(): string {
    return this.status;
  }
}

export default Ship;
