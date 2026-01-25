import { Quest } from '../quest.ts'

type TMap = {
  width: number
  height: number
  active: number
  data: Uint8Array
}

class ArrayPool {
  arrays: Uint8Array[] = []
  size: number

  constructor(size: number) {
    this.size = size
  }

  aquire(): Uint8Array {
    if (this.arrays.length > 0) {
      const a = this.arrays.pop()
      a!.fill(0)
      return a!
    } else {
      const a = new Uint8Array(this.size)
      return a
    }
  }

  release(a: Uint8Array) {
    this.arrays.push(a)
  }
}

export class Quest14 extends Quest<TMap> {
  arrayPool: ArrayPool = new ArrayPool(1)

  constructor() {
    super(14)
  }

  loadInput(part: number): TMap {
    const data = this.readDataFile(part)
    const width = data[0].length
    const height = data.length

    this.arrayPool = new ArrayPool(width * height)

    const map: TMap = {
      width,
      height,
      active: 0,
      data: this.arrayPool.aquire(),
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = data[y][x] === '#' ? 1 : 0
        map.active += c
        map.data[x + y * width] = c
      }
    }

    return map
  }

  get(map: TMap, x: number, y: number): number {
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
      return 0
    }
    return map.data[x + y * map.width]
  }

  set(map: TMap, x: number, y: number, value: number) {
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
      return
    }
    map.data[x + y * map.width] = value ? 1 : 0
    if (value) {
      map.active++
    }
  }

  round(map: TMap): TMap {
    const newMap: TMap = {
      width: map.width,
      height: map.height,
      active: 0,
      data: this.arrayPool.aquire(),
    }

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const a = this.get(map, x, y)
        const neighbors = this.get(map, x - 1, y - 1) + this.get(map, x + 1, y - 1) + this.get(map, x - 1, y + 1) + this.get(map, x + 1, y + 1)

        if (a === 1 && (neighbors & 1) === 1) {
          this.set(newMap, x, y, 1)
        } else if (a === 0 && (neighbors & 1) === 0) {
          this.set(newMap, x, y, 1)
        }
      }
    }
    this.arrayPool.release(map.data)

    return newMap
  }

  matchPattern(map: TMap, pattern: TMap): boolean {
    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        if (this.get(map, x + 13, y + 13) !== this.get(pattern, x, y)) {
          return false
        }
      }
    }
    return true
  }

  part1(map: TMap): number {
    let total = 0
    for (let r = 0; r < 10; r++) {
      map = this.round(map)
      total += map.active
    }
    return total
  }

  part2(map: TMap): number {
    let total = 0
    for (let r = 0; r < 2025; r++) {
      map = this.round(map)
      total += map.active
    }
    return total
  }

  part3(pattern: TMap): number {
    this.arrayPool = new ArrayPool(34 * 34)

    let map: TMap = {
      width: 34,
      height: 34,
      active: 0,
      data: this.arrayPool.aquire(),
    }

    let previous = -1
    let active1 = -1
    let active2 = -1
    let first = -1
    let total = 0

    const limit = 1000000000

    for (let i = 0; i < limit; i++) {
      map = this.round(map)
      if (this.matchPattern(map, pattern) && map.active) {
        if (previous !== -1 && active1 === -1) {
          active1 = previous
          active2 = map.active
          first = i
        } else if (previous === active1 && map.active === active2) {
          const offset = i - first
          const remaining = limit - i
          const jump = Math.floor(remaining / offset)
          total += (total - previous) * jump
          i += jump * offset
        } else {
          previous = map.active
        }
        total += map.active
      }
    }
    return total
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest14().execute()
}
