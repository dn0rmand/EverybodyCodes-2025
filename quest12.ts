import { Quest } from './tools/quest.ts'

type TPoint = {
  x: number
  y: number
}

type TInput = number[][]

export class Quest12 extends Quest<TInput> {
  width: number = 0
  height: number = 0

  constructor() {
    super(12)
  }

  loadInput(part: number): TInput {
    const barrels = this.readDataFile(part).map(line => line.split('').map(v => +v))
    this.height = barrels.length
    this.width = barrels[0].length
    return barrels
  }

  createExplodedArray(): Uint8Array {
    return new Uint8Array(this.width * this.height)
  }

  isExploded(exploded: Uint8Array, x: number, y: number): boolean {
    return exploded[x + this.width * y] !== 0
  }

  setExploded(exploded: Uint8Array, x: number, y: number) {
    exploded[x + this.width * y] = 1
  }

  explode(barrels: number[][], exploded: Uint8Array, x: number, y: number): number {
    if (y < 0 || x < 0 || y >= this.height || x >= this.width) {
      return 0
    }
    if (this.isExploded(exploded, x, y)) {
      return 0
    }
    const v = barrels[y][x]

    let moves = [
      { x: x - 1, y },
      { x, y: y - 1 },
      { x: x + 1, y },
      { x, y: y + 1 },
    ]

    moves = moves
      // Get valid x,y
      .filter(({ x, y }) => x >= 0 && y >= 0 && x < this.width && y < this.height)
      // Get valid neighbors
      .filter(({ x, y }) => barrels[y][x] >= 0 && barrels[y][x] <= v && !this.isExploded(exploded, x, y))

    this.setExploded(exploded, x, y)

    return moves.reduce((a, e) => a + this.explode(barrels, exploded, e.x, e.y), 1)
  }

  applyExplodedBarrels(barrels: number[][], exploded: Uint8Array) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.isExploded(exploded, x, y)) {
          barrels[y][x] = -100
        }
      }
    }
  }

  remaining(barrels: number[][]): TPoint[] {
    const nonExploded: TPoint[] = []

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (barrels[y][x] >= 0) {
          nonExploded.push({ x, y })
        }
      }
    }
    return nonExploded
  }

  findBest(barrels: number[][], alreadyExploded: Uint8Array): TPoint {
    const best = { x: 0, y: 0, exploded: 0 }

    let remaining = this.remaining(barrels).sort((a, b) => barrels[b.y][b.x] - barrels[a.y][a.x])

    while (remaining.length > 0) {
      const { x, y } = remaining[0]
      const exploded = alreadyExploded.slice()
      const count = this.explode(barrels, exploded, x, y)
      if (count > best.exploded) {
        best.exploded = count
        best.x = x
        best.y = y
      }
      remaining = remaining.filter(({ x, y }) => !this.isExploded(exploded, x, y))
    }
    return { x: best.x, y: best.y }
  }

  part1(barrels: TInput): number {
    const exploded = this.createExplodedArray()
    return this.explode(barrels, exploded, 0, 0)
  }

  part2(barrels: TInput): number {
    const exploded = this.createExplodedArray()
    return this.explode(barrels, exploded, 0, 0) + this.explode(barrels, exploded, this.width - 1, this.height - 1)
  }

  part3(barrels: TInput): number {
    let total = 0
    const exploded = this.createExplodedArray()

    const best1 = this.findBest(barrels, exploded)
    total += this.explode(barrels, exploded, best1.x, best1.y)

    const best2 = this.findBest(barrels, exploded)
    total += this.explode(barrels, exploded, best2.x, best2.y)

    const best3 = this.findBest(barrels, exploded)
    total += this.explode(barrels, exploded, best3.x, best3.y)

    return total
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest12().execute()
}
