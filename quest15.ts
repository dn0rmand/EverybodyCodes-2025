import { Quest } from './tools/quest.ts'

type TInstruction = {
  direction: 'L' | 'R'
  distance: number
}

enum ENTRY {
  EMPTY = 0,
  WALL = 1,
  START = 2,
  END = 3,
  VISITED = 4,
}

type TPoint = {
  x: number
  y: number
}

type TState = {
  point: TPoint
  distance: number
}

type TCompressedPoint = {
  previous: number
  next: number
}

type TCompression = {
  xs: Map<number, TCompressedPoint>
  ys: Map<number, TCompressedPoint>
}

type TMap = {
  minX: number
  maxX: number
  minY: number
  maxY: number
  data: Map<number, Map<number, ENTRY>>
  compression: TCompression
}

export class Quest15 extends Quest<TInstruction[]> {
  constructor() {
    super(15)
  }

  loadInput(part: number): TInstruction[] {
    const data = this.readDataFile(part)[0]

    return data.split(',').map(s => ({
      direction: s[0] === 'R' ? 'R' : 'L',
      distance: +s.substring(1),
    }))
  }

  get(map: TMap, pt: TPoint): ENTRY {
    const row = map.data.get(pt.y)
    return row ? row.get(pt.x) ?? ENTRY.EMPTY : ENTRY.EMPTY
  }

  set(map: TMap, pt: TPoint, value: ENTRY) {
    let row = map.data.get(pt.y)
    if (row === undefined) {
      row = new Map()
      map.data.set(pt.y, row)
    }
    row.set(pt.x, value)
    map.maxX = Math.max(map.maxX, pt.x)
    map.maxY = Math.max(map.maxY, pt.y)
    map.minX = Math.min(map.minX, pt.x)
    map.minY = Math.min(map.minY, pt.y)
  }

  move(map: TMap, pt: TPoint, dx: number, dy: number): TPoint {
    if (dx < -1 || dx > 1 || dy < -1 || dy > 1) {
      throw 'Invalid move'
    }
    if (dx !== 0 && dy !== 0) {
      throw 'Invalid move'
    }

    if (dx !== 0) {
      const info = map.compression.xs.get(pt.x)
      if (info !== undefined) {
        if (dx < 0) {
          return { x: info.previous, y: pt.y }
        } else {
          return { x: info.next, y: pt.y }
        }
      } else {
        return { x: pt.x + dx, y: pt.y }
      }
    } else if (dy !== 0) {
      const info = map.compression.ys.get(pt.y)
      if (info !== undefined) {
        if (dy < 0) {
          return { x: pt.x, y: info.previous }
        } else {
          return { x: pt.x, y: info.next }
        }
      } else {
        return { x: pt.x, y: pt.y + dy }
      }
    } else {
      return pt
    }
  }

  applyDirection(direction: string, turn: 'L' | 'R'): string {
    if (turn == 'L') {
      switch (direction) {
        case 'U':
          return 'L'
        case 'R':
          return 'U'
        case 'D':
          return 'R'
        case 'L':
          return 'D'
        default:
          return direction
      }
    } else {
      switch (direction) {
        case 'U':
          return 'R'
        case 'R':
          return 'D'
        case 'D':
          return 'L'
        case 'L':
          return 'U'
        default:
          return direction
      }
    }
  }

  generatePoints(instructions: TInstruction[]): TPoint[] {
    const points: TPoint[] = []

    let direction = 'U'
    let pt: TPoint = { x: 0, y: 0 }

    points.push(pt)

    for (const instruction of instructions) {
      direction = this.applyDirection(direction, instruction.direction)

      switch (direction) {
        case 'U':
          pt = { x: pt.x, y: pt.y - instruction.distance }
          break
        case 'D':
          pt = { x: pt.x, y: pt.y + instruction.distance }
          break
        case 'L':
          pt = { x: pt.x - instruction.distance, y: pt.y }
          break
        case 'R':
          pt = { x: pt.x + instruction.distance, y: pt.y }
          break
        default:
          throw 'Invalid direction'
      }

      points.push(pt)
    }

    return points
  }

  compressePoints(instructions: TInstruction[]): TCompression {
    const points = this.generatePoints(instructions)
    const compression = {
      xs: new Map(),
      ys: new Map(),
    }

    const addX = (x: number): TCompressedPoint => {
      const old = compression.xs.get(x)
      if (old === undefined) {
        const c = { previous: x - 1, next: x + 1 }
        compression.xs.set(x, c)
        return c
      } else {
        return old
      }
    }
    const addY = (y: number): TCompressedPoint => {
      const old = compression.ys.get(y)
      if (old === undefined) {
        const c = { previous: y - 1, next: y + 1 }
        compression.ys.set(y, c)
        return c
      } else {
        return old
      }
    }

    const SIZE = 5

    // Compress xs
    points.sort((a, b) => a.x - b.x)
    for (let i = 1; i < points.length; i++) {
      const x1 = points[i - 1].x
      const x2 = points[i].x
      if (x2 - x1 > SIZE) {
        const c1 = addX(x1 + 1)
        const c2 = addX(x2 - 1)
        c1.next = x2 - 1
        c2.previous = x1 + 1
      }
    }
    // Compress ys
    points.sort((a, b) => a.y - b.y)
    for (let i = 1; i < points.length; i++) {
      const y1 = points[i - 1].y
      const y2 = points[i].y
      if (y2 - y1 > SIZE) {
        const c1 = addY(y1 + 1)
        const c2 = addY(y2 - 1)
        c1.next = y2 - 1
        c2.previous = y1 + 1
      }
    }

    return compression
  }

  generateMap(instructions: TInstruction[]): TMap {
    const map: TMap = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      data: new Map(),
      compression: this.compressePoints(instructions),
    }

    let direction = 'U'
    let pt: TPoint = { x: 0, y: 0 }

    this.set(map, pt, ENTRY.START)

    for (const instruction of instructions) {
      direction = this.applyDirection(direction, instruction.direction)

      switch (direction) {
        case 'U':
          for (let i = 0; i < instruction.distance; ) {
            const newPt = this.move(map, pt, 0, -1)
            i += Math.abs(newPt.y - pt.y)
            pt = newPt
            this.set(map, pt, ENTRY.WALL)
          }
          break
        case 'D':
          for (let i = 0; i < instruction.distance; ) {
            const newPt = this.move(map, pt, 0, 1)
            i += Math.abs(newPt.y - pt.y)
            pt = newPt
            this.set(map, pt, ENTRY.WALL)
          }
          break
        case 'L':
          for (let i = 0; i < instruction.distance; ) {
            const newPt = this.move(map, pt, -1, 0)
            i += Math.abs(newPt.x - pt.x)
            pt = newPt
            this.set(map, pt, ENTRY.WALL)
          }
          break
        case 'R':
          for (let i = 0; i < instruction.distance; ) {
            const newPt = this.move(map, pt, 1, 0)
            i += Math.abs(newPt.x - pt.x)
            pt = newPt
            this.set(map, pt, ENTRY.WALL)
          }
          break
        default:
          throw 'Invalid direction'
      }
    }
    this.set(map, pt, ENTRY.END)
    return map
  }

  findExit(map: TMap): number {
    let states: TState[] = [{ point: { x: 0, y: 0 }, distance: 0 }]
    const visited: Map<string, number> = new Map()

    const moves = [
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
    ]

    let best = Number.MAX_SAFE_INTEGER
    visited.set('0:0', 0)
    while (states.length > 0) {
      const newStates: TState[] = []

      for (const state of states) {
        for (const { dx, dy } of moves) {
          const point = this.move(map, state.point, dx, dy)
          if (point.x < map.minX - 1 || point.x > map.maxX + 1 || point.y < map.minY - 1 || point.y > map.maxY + 1) {
            continue
          }
          const distance = state.distance + Math.abs(state.point.x - point.x) + Math.abs(state.point.y - point.y)
          if (distance >= best) {
            continue
          }

          const entry = this.get(map, point)
          if (entry === ENTRY.END) {
            if (best > distance) {
              best = distance
              continue
            }
          }

          if (entry === ENTRY.WALL || entry === ENTRY.VISITED || entry === ENTRY.START) {
            continue
          }
          const key = `${point.x}:${point.y}`
          const old = visited.get(key)
          if (old !== undefined && old <= distance) {
            continue
          }
          visited.set(key, distance)
          newStates.push({ point, distance })
        }
      }

      states = newStates
    }

    return best
  }

  part1(instructions: TInstruction[]): number {
    const map = this.generateMap(instructions)
    return this.findExit(map)
  }

  part2(instructions: TInstruction[]): number {
    const map = this.generateMap(instructions)
    return this.findExit(map)
  }

  part3(instructions: TInstruction[]): number {
    const map = this.generateMap(instructions)
    return this.findExit(map)
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest15().execute()
}
