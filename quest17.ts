import { Quest } from './tools/quest.ts'

const LEFT = 1
const RIGHT = 2

const TOP = 1
const BOTTOM = 4

const TOP_LEFT = LEFT * TOP
const TOP_RIGHT = RIGHT * TOP
const BOTTOM_LEFT = LEFT * BOTTOM
const BOTTOM_RIGHT = RIGHT * BOTTOM
const LOOPED = TOP_LEFT | TOP_RIGHT | BOTTOM_LEFT | BOTTOM_RIGHT

type TPoint = {
  x: number
  y: number
}

type TState = {
  point: TPoint
  time: number
  quadrant: number
}

type TMap = {
  width: number
  height: number
  center: TPoint
  start: TPoint
  data: number[][]
}

export class Quest17 extends Quest<TMap> {
  constructor() {
    super(17)
  }

  loadInput(part: number): TMap {
    const input = this.readDataFile(part)
    const height = input.length
    const width = input[0].length
    const center: TPoint = { x: 0, y: 0 }
    const start: TPoint = { x: 0, y: 0 }

    const data = input.map((r, y) =>
      r.split('').map((v, x) => {
        if (v === '@') {
          center.x = x
          center.y = y
          return 0
        } else if (v === 'S') {
          start.x = x
          start.y = y
          return 0
        } else {
          return +v
        }
      }),
    )

    return { width, height, center, start, data }
  }

  getQuadrant(map: TMap, point: TPoint): number {
    const h = point.x < map.center.x ? LEFT : point.x > map.center.x ? RIGHT : 0
    const v = point.y < map.center.y ? TOP : point.y > map.center.y ? BOTTOM : 0

    return h * v
  }

  getDistance(map: TMap, point: TPoint): number {
    const v = (point.x - map.center.x) ** 2 + (point.y - map.center.y) ** 2
    return v
  }

  check(map: TMap, point: TPoint, radius: number): boolean {
    const v = this.getDistance(map, point)
    const R = radius ** 2

    return v <= R
  }

  getSum(row: number[], x1: number, x2: number): number {
    const values = row.slice(x1, row.length + (1 + x2))
    return values.reduce((a, v) => a + v, 0)
  }

  calculate(map: TMap, radius: number): number {
    let x1 = 0
    let x2 = -1
    let total = 0
    for (let y1 = map.center.y, y2 = y1; y1 >= 0; y1--, y2++) {
      while (!this.check(map, { x: x1, y: y1 }, radius)) {
        x1++
        x2--
        if (x1 > map.center.x) {
          break
        }
      }
      const v1 = this.getSum(map.data[y1], x1, x2)
      const v2 = y1 === y2 ? 0 : this.getSum(map.data[y2], x1, x2)
      total += v1 + v2
    }

    return total
  }

  makeKey(state: TState): number {
    let key: number

    key = state.point.y * 153 + state.point.x
    key = key * 16 + state.quadrant

    return key
  }

  isDone(map: TMap, state: TState): boolean {
    return state.quadrant == LOOPED && state.point.x === map.start.x && state.point.y === map.start.y
  }

  moves(map: TMap, R: number, state: TState): TState[] {
    let moves: TPoint[] = [
      { x: state.point.x + 1, y: state.point.y },
      { x: state.point.x - 1, y: state.point.y },
      { x: state.point.x, y: state.point.y + 1 },
      { x: state.point.x, y: state.point.y - 1 },
    ]

    moves = moves
      .filter(p => p.x >= 0 && p.x < map.width && p.y >= 0 && p.y < map.height)
      .filter(p => p.x !== map.center.x || p.y !== map.center.y)
      .filter(p => this.getDistance(map, p) > R)

    const newStates: TState[] = moves.map(p => ({
      point: p,
      quadrant: state.quadrant | this.getQuadrant(map, p),
      time: state.time + map.data[p.y][p.x],
    }))

    return newStates
  }

  getMaxTime(map: TMap): number {
    return map.center.x * 30
  }

  getBestPath(map: TMap, radius: number) {
    const visited: Map<number, number> = new Map()
    let states: Map<number, TState> = new Map()
    let newStates: Map<number, TState> = new Map()

    const start: TState = {
      point: map.start,
      time: 0,
      quadrant: this.getQuadrant(map, map.start),
    }

    states.set(this.makeKey(start), start)
    visited.set(this.makeKey(start), 0)

    const R = radius ** 2

    let maxTime = (radius + 1) * 30 - 1
    let bestTime = Number.MAX_SAFE_INTEGER

    while (states.size > 0) {
      newStates.clear()
      for (const state of states.values()) {
        for (const newState of this.moves(map, R, state)) {
          if (newState.time > maxTime) {
            continue
          }
          if (this.isDone(map, newState)) {
            bestTime = Math.min(bestTime, newState.time)
            maxTime = bestTime
            continue
          }

          const key = this.makeKey(newState)

          const oldTime = visited.get(key)
          if (oldTime !== undefined && oldTime <= newState.time) {
            continue
          }
          visited.set(key, newState.time)

          const old = newStates.get(key)
          if (old === undefined || old.time > newState.time) {
            newStates.set(key, newState)
          }
        }
      }
      ;[states, newStates] = [newStates, states]
    }

    return bestTime
  }

  part1(map: TMap): number {
    return this.calculate(map, 10)
  }

  part2(map: TMap): number {
    let best = 0
    let bestR = 0
    let previous = 0
    for (let r = 1; r <= map.center.x; r++) {
      const value = this.calculate(map, r)
      const offset = value - previous
      previous = value
      if (offset > best) {
        best = offset
        bestR = r
      }
    }
    return best * bestR
  }

  part3(map: TMap): number {
    const middle = Math.floor(map.center.x / 2)
    let time = this.getBestPath(map, middle)

    if (time >= Number.MAX_SAFE_INTEGER) {
      for (let radius = middle + 1; radius < map.center.x; radius++) {
        time = this.getBestPath(map, radius)
        if (time < Number.MAX_SAFE_INTEGER) {
          return time * radius
        }
      }
    } else {
      let bestRadius = middle
      let bestTime = time
      for (let radius = middle - 1; radius > 0; radius--) {
        time = this.getBestPath(map, radius)
        if (time >= Number.MAX_SAFE_INTEGER) {
          return bestTime * bestRadius
        } else {
          bestTime = time
          bestRadius = radius
        }
      }
    }

    throw 'Not found'
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest17().execute()
}
