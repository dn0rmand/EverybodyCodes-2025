import { Quest } from '../quest.ts'

class TMap {
  private visited: Set<string>
  private tmp: Set<string> | null
  private minX: number = Number.MAX_SAFE_INTEGER
  private maxX: number = 0
  private minY: number = Number.MAX_SAFE_INTEGER
  private maxY: number = 0

  constructor() {
    this.visited = new Set()
    this.tmp = null
  }

  private getKey(x: number, y: number): string {
    return `${x}:${y}`
  }

  get(x: number, y: number): boolean {
    const key = this.getKey(x, y)
    if (this.tmp !== null && this.tmp.has(key)) {
      return true
    }
    return this.visited.has(key)
  }

  set(x: number, y: number): boolean {
    if (this.get(x, y)) {
      return true // Already set
    }
    if (x < this.minX || y < this.minY || x > this.maxX || y > this.maxY) {
      if (this.tmp !== null) {
        // cannot grow while in a transaction
        return false
      }
      this.minX = Math.min(this.minX, x)
      this.maxX = Math.max(this.maxX, x)
      this.minY = Math.min(this.minY, y)
      this.maxY = Math.max(this.maxY, y)
    }
    const key = this.getKey(x, y)
    if (this.tmp !== null) {
      this.tmp.add(key)
    } else {
      this.visited.add(key)
    }
    return true
  }

  begin() {
    if (this.tmp !== null) {
      throw 'Already in a transaction'
    }
    this.tmp = new Set()
  }

  commit() {
    if (this.tmp === null) {
      throw 'Not in a transaction'
    }
    if (this.tmp.size > 0) {
      this.visited = this.visited.union(this.tmp)
    }
    this.tmp = null
  }

  rollback() {
    if (this.tmp === null) {
      throw 'Not in a transaction'
    }
    this.tmp = null
  }
}

type TPoint = {
  x: number
  y: number
}

type TInput = {
  map: TMap
  origin: TPoint
  bones: TPoint[]
}

const simpleDirections = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
]

const part3Directions = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: 0 },
]

export class Quest02 extends Quest<TInput> {
  constructor() {
    super(2, 3)
  }

  getKey(x: number, y: number): string {
    return `${x}:${y}`
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)
    const map = new TMap()

    const origin: TPoint = { x: 0, y: 0 }
    const bones: TPoint[] = []

    for (let y = 0; y < data.length; y++) {
      const r = data[y]
      for (let x = 0; x < r.length; x++) {
        const c = r[x]
        if (c === '#') {
          map.set(x, y)
          bones.push({ x, y })
        } else if (c === '@') {
          map.set(x, y)
          origin.x = x
          origin.y = y
        }
      }
    }
    const input = {
      map,
      origin,
      bones,
    }
    return input
  }

  fill(input: TInput, x: number, y: number): boolean {
    const map = input.map

    function inner(x: number, y: number): boolean {
      if (map.get(x, y)) {
        return true
      }

      if (!map.set(x, y)) {
        return false
      }

      return inner(x - 1, y) && inner(x + 1, y) && inner(x, y - 1) && inner(x, y + 1)
    }

    map.begin()

    const filled = inner(x, y)

    if (!filled) {
      map.rollback()
    } else {
      map.commit()
    }

    return filled
  }

  // dump(input: TInput, x0: number, y0: number) {
  //   const { x: xt, y: yt } = input.target

  //   for (let y = yt - 10; y < yt + 10; y++) {
  //     const line = []
  //     for (let x = xt - 10; x < xt + 10; x++) {
  //       let c = input.map.get(x, y) ? '+' : '.'
  //       if (x === x0 && y === y0) {
  //         c = '@'
  //       } else if (x === xt && y === yt) {
  //         c = '#'
  //       }
  //       line.push(c)
  //     }
  //     console.log(line.join(''))
  //   }
  //   console.log()
  // }

  boneSurrounded(input: TInput, bone: TPoint): boolean {
    return (
      this.fill(input, bone.x, bone.y + 1) && this.fill(input, bone.x, bone.y - 1) && this.fill(input, bone.x + 1, bone.y) && this.fill(input, bone.x - 1, bone.y)
    )
  }

  isFinished(input: TInput): boolean {
    for (const b of input.bones) {
      if (!this.boneSurrounded(input, b)) {
        return false
      }
    }
    return true
  }

  process(input: TInput, part: number): number {
    let { x, y } = input.origin
    const { x: xt, y: yt } = input.bones[0]

    let dir = 0
    let steps = 0
    let skipped = 0

    const directions = part === 3 ? part3Directions : simpleDirections

    while (true) {
      const { dx, dy } = directions[dir]
      dir = (dir + 1) % directions.length
      const x1 = x + dx
      const y1 = y + dy

      skipped++
      if (skipped > 10) {
        throw 'No solutions'
      }

      if (part === 1 && x1 === xt && y1 == yt) {
        steps++
        break
      }

      if (input.map.get(x1, y1)) {
        continue
      }

      if (part !== 1 && this.fill(input, x1, y1)) {
        continue
      }

      steps++
      x = x1
      y = y1
      input.map.set(x, y)

      skipped = 0

      if (part !== 1 && this.isFinished(input)) {
        break
      }
    }
    return steps
  }

  part1(input: TInput): number {
    return this.process(input, 1)
  }

  part2(input: TInput): number {
    return this.process(input, 2)
  }

  part3(input: TInput): number {
    return this.process(input, 3)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest02().execute()
}
