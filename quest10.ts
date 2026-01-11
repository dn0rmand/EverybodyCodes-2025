import { Quest } from './tools/quest.ts'

type TPosition = {
  x: number
  y: number
}

const MAX_WIDTH = 101

const getKey = (p: TPosition): number => p.x + p.y * MAX_WIDTH

type TInput = {
  sheeps: TPosition[]
  dragon: TPosition
  data: string[]
}

class TState {
  dragon: TPosition
  sheeps: TPosition[]
  count: number

  constructor(dragon: TPosition, sheeps: TPosition[], count: number) {
    this.dragon = dragon
    this.sheeps = sheeps
    this.count = count
  }

  getKey(): number {
    let key = this.dragon.x * 10 + this.dragon.y + 1

    for (const sheep of this.sheeps) {
      key = key * 10 + sheep.x
      key = key * 10 + sheep.y
    }

    return key
  }

  dragonMoves(width: number, height: number, data: string[]): TState[] {
    const { x, y } = this.dragon
    let moves: TPosition[] = [
      { x: x - 2, y: y - 1 },
      { x: x - 2, y: y + 1 },
      { x: x + 2, y: y - 1 },
      { x: x + 2, y: y + 1 },

      { x: x - 1, y: y - 2 },
      { x: x + 1, y: y - 2 },
      { x: x - 1, y: y + 2 },
      { x: x + 1, y: y + 2 },
    ]

    moves = moves.filter(p => p.x >= 0 && p.y >= 0 && p.x < width && p.y < height)

    const newStates: TState[] = []

    for (const move of moves) {
      if (data[move.y][move.x] === '#') {
        newStates.push(new TState(move, this.sheeps, this.count))
      } else {
        const remainingSheeps = this.sheeps.filter(s => s.x != move.x || s.y != move.y)
        newStates.push(new TState(move, remainingSheeps, this.count))
      }
    }

    return newStates
  }

  isSafe(x: number, y: number, height: number, data: string[]): boolean {
    while (y < height) {
      if (data[y][x] !== '#') {
        return false
      }
      y++
    }
    return true
  }

  sheepMoves(height: number, data: string[]): TState[] {
    const newStates: TState[] = []

    let d = this.dragon
    if (data[d.y][d.x] === '#') {
      d = { x: -1, y: -1 } // ignore dragon
    }

    let hasMoves = false
    for (let i = 0; i < this.sheeps.length; i++) {
      const sheep = this.sheeps[i]
      if (sheep.x === d.x && sheep.y + 1 === d.y) {
        continue // do go get eaten
      }
      hasMoves = true
      if (!this.isSafe(sheep.x, sheep.y, height, data)) {
        const newSheeps = [...this.sheeps]
        newSheeps[i] = { x: sheep.x, y: sheep.y + 1 }
        newStates.push(new TState(this.dragon, newSheeps, this.count))
      }
    }
    if (!hasMoves) {
      newStates.push(this)
    }
    return newStates
  }
}

export class Quest10 extends Quest<TInput> {
  width: number = 0
  height: number = 0

  constructor() {
    super(10)
  }

  addVisited = (visited: Set<number>, state: TPosition) => visited.add(getKey(state))
  isVisited = (visited: Set<number>, state: TPosition): boolean => visited.has(getKey(state))
  getMoves = (state: TPosition): TPosition[] => {
    const newPositions: TPosition[] = [
      { x: state.x - 2, y: state.y - 1 },
      { x: state.x - 2, y: state.y + 1 },
      { x: state.x + 2, y: state.y - 1 },
      { x: state.x + 2, y: state.y + 1 },

      { x: state.x - 1, y: state.y - 2 },
      { x: state.x + 1, y: state.y - 2 },
      { x: state.x - 1, y: state.y + 2 },
      { x: state.x + 1, y: state.y + 2 },
    ]

    return newPositions.filter(p => p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height)
  }

  loadInput(part: number): TInput {
    const data = this.readDataFile(part)

    const sheeps: TPosition[] = []
    const dragon: TPosition = { x: 0, y: 0 }
    this.width = data[0].length
    this.height = data.length

    for (let y = 0; y < this.height; y++) {
      const line = data[y]
      for (let x = 0; x < this.width; x++) {
        if (line[x] === 'D') {
          dragon.x = x
          dragon.y = y
        } else if (line[x] === 'S') {
          sheeps.push({ x, y })
        }
      }
    }

    return { dragon, sheeps, data }
  }

  part1(input: TInput): number {
    const visited: Set<number> = new Set()

    let states: TPosition[] = [input.dragon]

    this.addVisited(visited, input.dragon)

    for (let moves = 0; moves < 4; moves++) {
      const newStates: TPosition[] = []
      for (const state of states) {
        for (const newState of this.getMoves(state)) {
          if (!this.isVisited(visited, newState)) {
            newStates.push(newState)
            this.addVisited(visited, newState)
          }
        }
      }
      states = newStates
    }

    return input.sheeps.filter(s => this.isVisited(visited, s)).length
  }

  part2(input: TInput): number {
    let states: TPosition[] = [input.dragon]

    let total = 0
    for (let moves = 0; moves < 20; moves++) {
      // Move dragon
      const visited: Set<number> = new Set()
      const newStates: TPosition[] = []
      for (const state of states) {
        for (const newState of this.getMoves(state)) {
          if (!this.isVisited(visited, newState)) {
            newStates.push(newState)
            this.addVisited(visited, newState)
          }
        }
      }
      // eat sheeps
      let dragons = newStates.filter(d => input.data[d.y][d.x] !== '#')
      let remainingSheeps = input.sheeps.filter(s => !dragons.find(d => d.x === s.x && d.y === s.y))
      total += input.sheeps.length - remainingSheeps.length

      input.sheeps = remainingSheeps
        // move sheeps
        .map(s => ({ x: s.x, y: s.y + 1 }))
        // remove the ones out of the board
        .filter(s => s.y < this.height)

      // eat sheeps again
      dragons = newStates.filter(d => input.data[d.y][d.x] !== '#')
      remainingSheeps = input.sheeps.filter(s => !dragons.find(d => d.x === s.x && d.y === s.y))
      total += input.sheeps.length - remainingSheeps.length

      input.sheeps = remainingSheeps
      states = newStates
    }
    return total
  }

  part3(input: TInput): number {
    let states: Map<number, TState> = new Map()
    let newStates: Map<number, TState> = new Map()

    states.set(0, new TState(input.dragon, input.sheeps, 1))

    const addState = (state: TState) => {
      const key = state.getKey()
      const old = newStates.get(key)
      if (old !== undefined) {
        old.count += state.count
      } else {
        newStates.set(key, state)
      }
    }

    let sheepTurn = false
    let total = 0
    while (states.size > 0) {
      sheepTurn = !sheepTurn
      newStates.clear()
      for (const state of states.values()) {
        const moves = sheepTurn ? state.sheepMoves(this.height, input.data) : state.dragonMoves(this.width, this.height, input.data)

        for (const newState of moves) {
          if (newState.sheeps.length === 0) {
            total += newState.count
          } else {
            addState(newState)
          }
        }
      }
      ;[states, newStates] = [newStates, states]
    }
    return total
  }
}

if (!Deno.mainModule.endsWith('/main.ts')) {
  new Quest10().execute()
}
